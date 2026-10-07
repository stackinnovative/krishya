import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { DEFAULT_STORE_NAME } from "@/lib/contact";
import { getProductByIdForUserApi, getRelatedProductsApi } from "@/modules/products/api/storefront-product.api";
import { getSettings } from "@/modules/settings/server";
import { productKeys } from "@/shared/query-keys";
import ProductDetailContent from "./ProductDetailContent";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [product, settings] = await Promise.all([
    getProductByIdForUserApi(id)
      .then((r) => r.data)
      .catch(() => null),
    getSettings(),
  ]);

  if (!product) return { title: "Product not found" };

  const description = product.description ? product.description.slice(0, 160) : `Shop ${product.name} at ${settings?.storeName || DEFAULT_STORE_NAME}.`;
  const image = product.colorOptions[0]?.images[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | ${settings?.storeName || DEFAULT_STORE_NAME}`,
      description,
      images: image ? [{ url: getOptimizedImageUrl(image, 800) }] : undefined,
    },
  };
}

// Server-rendered (product details + related products) so a crawler sees
// the real product name/price/description/image in the initial HTML -
// previously this whole page was client-only and fetched everything after
// hydration, so it was invisible to non-JS crawlers and had no per-product
// metadata at all.
export default async function ProductDetailsPage({ params }: Params) {
  const { id } = await params;
  const queryClient = new QueryClient();

  const product = await queryClient
    .fetchQuery({
      queryKey: [...productKeys.userDetails, id],
      queryFn: () => getProductByIdForUserApi(id),
    })
    .then((r) => r.data)
    .catch(() => null);

  if (product?.categoryId) {
    await queryClient.prefetchQuery({
      queryKey: [...productKeys.related, product.categoryId, id],
      queryFn: () => getRelatedProductsApi(product.categoryId, id),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailContent id={id} />
    </HydrationBoundary>
  );
}
