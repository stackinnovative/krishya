import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <XCircle size={56} className="mx-auto" style={{ color: "#b8412f" }} />
      <h1 className="mt-4 font-serif text-3xl font-semibold">Payment cancelled</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        No charge was made. Your cart is still saved.
      </p>
      <Link href="/cart" className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
        Back to cart
      </Link>
    </div>
  );
}
