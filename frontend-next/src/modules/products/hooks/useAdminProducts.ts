import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addColorOptionApi,
  addVariantApi,
  blockProductApi,
  createProductApi,
  editColorOptionApi,
  editProductApi,
  getAllProductsForAdminApi,
  getProductByIdForAdminApi,
  unblockProductApi,
  updateVariantApi,
} from "../api/product.api";
import type { CreateProductPayload, UpdateProductPayload } from "../types/product.type";
import type { ResolvedWizardColor } from "../components/wizard/wizard.types";
import { resolveDefaultVariant } from "../components/wizard/validation";
import { productKeys } from "@/shared/query-keys";

export const useAdminProducts = (query: Record<string, unknown>) =>
  useQuery({
    queryKey: [...productKeys.adminList, query],
    queryFn: () => getAllProductsForAdminApi(query),
    placeholderData: (prev) => prev,
  });

export const useAdminProductDetails = (id: string | null) =>
  useQuery({
    queryKey: [...productKeys.adminDetails, id],
    queryFn: () => getProductByIdForAdminApi(id as string),
    enabled: !!id,
  });

/** Every place a product's admin edit needs to be reflected: its own admin views, plus every storefront surface that reads product data. */
const invalidateAllProductViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: productKeys.adminList });
  queryClient.invalidateQueries({ queryKey: productKeys.adminDetails });
  queryClient.invalidateQueries({ queryKey: productKeys.userList });
  queryClient.invalidateQueries({ queryKey: productKeys.userDetails });
  queryClient.invalidateQueries({ queryKey: productKeys.featured });
  queryClient.invalidateQueries({ queryKey: productKeys.toteBagCollection });
  queryClient.invalidateQueries({ queryKey: productKeys.related });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => (isActive ? blockProductApi(id) : unblockProductApi(id)),
    // Blocking/unblocking changes whether the product is even visible on the storefront, not just its admin row.
    onSuccess: () => invalidateAllProductViews(queryClient),
    onError: () => toast.error("Could not update status."),
  });
};

/**
 * The backend treats colour options and their size/price/stock variants as
 * sub-resources of a product (separate POST/PUT endpoints per colour and
 * per variant) rather than one nested payload on update - see
 * modules/products/api/product.api.ts. Creation is the one exception: the
 * whole colours+sizes tree can go in the initial createProductApi call.
 * This syncs the wizard's in-memory colour list onto those endpoints for
 * an existing product: new colours/sizes are POSTed, colours/sizes that
 * already have a backend id are PUT.
 */
async function syncColorsForExistingProduct(productId: string, colors: ResolvedWizardColor[]) {
  const defaultVariant = resolveDefaultVariant(colors);

  for (const color of colors) {
    if (!color.id) {
      await addColorOptionApi(productId, {
        colorName: color.name,
        hex: color.hex,
        images: color.images,
        variants: color.sizes.map((s) => ({
          size: s.size,
          price: Number(s.price) || 0,
          stock: Number(s.stock) || 0,
          isDefault: s === defaultVariant,
        })),
      });
      continue;
    }
    await editColorOptionApi(productId, color.id, { colorName: color.name, hex: color.hex, images: color.images });
    for (const size of color.sizes) {
      if (!size.id) {
        await addVariantApi(productId, [
          {
            colorOptionId: color.id,
            size: size.size,
            price: Number(size.price) || 0,
            stock: Number(size.stock) || 0,
            isDefault: size === defaultVariant,
          },
        ]);
      } else {
        await updateVariantApi(productId, size.id, {
          size: size.size,
          price: Number(size.price) || 0,
          stock: Number(size.stock) || 0,
          isActive: true,
          isDefault: size === defaultVariant,
        });
      }
    }
  }
}

export type ProductDetailsInput = UpdateProductPayload;

export const useSaveProductWizard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      details,
      colors,
    }: {
      productId: string | null;
      details: ProductDetailsInput;
      colors: ResolvedWizardColor[];
    }) => {
      if (!productId) {
        const defaultVariant = resolveDefaultVariant(colors);
        const payload: CreateProductPayload = {
          ...details,
          colorOptions: colors.map((c) => ({
            colorName: c.name,
            hex: c.hex,
            images: c.images,
            variants: c.sizes.map((s) => ({
              size: s.size,
              price: Number(s.price) || 0,
              stock: Number(s.stock) || 0,
              isDefault: s === defaultVariant,
            })),
          })),
        };
        return createProductApi(payload);
      }

      await editProductApi(productId, details);
      await syncColorsForExistingProduct(productId, colors);
      return { success: true, message: "Product updated" };
    },
    onSuccess: (_res, vars) => {
      toast.success(vars.productId ? "Product updated" : "Product created");
      invalidateAllProductViews(queryClient);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Could not save the product.";
      toast.error(message);
    },
  });
};
