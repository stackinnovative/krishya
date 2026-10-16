import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  addVariantApi,
  blockProductApi,
  createProductApi,
  editProductApi,
  getAllProductsForAdminApi,
  getProductByIdForAdminApi,
  unblockProductApi,
  updateVariantApi,
} from "../api/product.api";
import type { UpdateProductPayload, VariantPayload } from "../types/product.type";
import { productKeys } from "@/shared/query-keys";
import { getApiErrorMessage } from "@/lib/errors";

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

/** A saved variant (has an id) or a new one, in the shape the variant endpoints take. */
export type WizardVariantPayload = VariantPayload & { id?: string };

const toVariantPayload = (v: WizardVariantPayload): VariantPayload => ({
  quantity: v.quantity,
  unit: v.unit,
  mrp: v.mrp,
  price: v.price,
  stock: v.stock,
  isActive: v.isActive,
  isDefault: v.isDefault,
});

/**
 * The backend treats a product's quantity variants as a sub-resource
 * (separate POST/PUT endpoints) rather than part of the edit payload - see
 * modules/products/api/product.api.ts. Creation is the one exception: every
 * variant goes in the initial createProductApi call. This syncs the wizard's
 * rows onto those endpoints for an existing product: new rows are POSTed in
 * one batch, saved rows are PUT.
 */
async function syncVariantsForExistingProduct(productId: string, variants: WizardVariantPayload[]) {
  const added = variants.filter((v) => !v.id).map(toVariantPayload);
  if (added.length) await addVariantApi(productId, added);

  for (const v of variants) {
    if (v.id) await updateVariantApi(productId, v.id, toVariantPayload(v));
  }
}

export type ProductDetailsInput = UpdateProductPayload;

export const useSaveProductWizard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      details,
      variants,
    }: {
      productId: string | null;
      details: ProductDetailsInput;
      variants: WizardVariantPayload[];
    }) => {
      if (!productId) {
        return createProductApi({ ...details, variants: variants.map(toVariantPayload) });
      }

      await editProductApi(productId, details);
      await syncVariantsForExistingProduct(productId, variants);
      return { success: true, message: "Product updated" };
    },
    onSuccess: (_res, vars) => {
      toast.success(vars.productId ? "Product updated" : "Product created");
      invalidateAllProductViews(queryClient);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Could not save the product."));
    },
  });
};
