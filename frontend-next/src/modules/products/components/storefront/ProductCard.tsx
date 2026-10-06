import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import type { UserProductListItem } from "../../types/storefront-product.type";

export default function ProductCard({ product }: { product: UserProductListItem }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
        {product.image && (
          <Image
            src={getOptimizedImageUrl(product.image, 500)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-2.5">
        <div className="text-sm font-medium">{product.name}</div>
        <div className="mt-0.5 text-sm font-semibold" style={{ color: "var(--accent-strong)" }}>
          ₹{product.price.toLocaleString("en-IN")}
        </div>
      </div>
    </Link>
  );
}
