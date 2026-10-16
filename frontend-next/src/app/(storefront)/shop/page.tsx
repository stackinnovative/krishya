import { redirect } from "next/navigation";

/** /shop on its own has no category - the full range lives at /products. */
export default function ShopIndexPage() {
  redirect("/products");
}
