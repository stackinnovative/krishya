import Link from "next/link";
import { SectionDecor } from "@/modules/storefront-shell/components/decor";
import { CloseIcon } from "@/modules/storefront-shell/components/icons";

export default function CheckoutCancelPage() {
  return (
    <section className="relative isolate mx-auto flex max-w-xl flex-col items-center gap-4 overflow-clip px-4 py-[clamp(48px,6vw,96px)] text-center">
      <SectionDecor variant="d" />
      <span className="grid h-[84px] w-[84px] place-items-center rounded-full border border-ka-line bg-ka-sand text-[#B8412F]">
        <CloseIcon size={34} strokeWidth={1.6} />
      </span>
      <h1 className="m-0 font-display text-[clamp(36px,4.4vw,52px)] font-medium text-ka-green">Payment cancelled</h1>
      <p className="m-0 text-base text-ka-body">No charge was made. Your cart is still saved.</p>
      <Link href="/cart" className="mt-4 flex h-[52px] items-center rounded-lg bg-ka-green px-8 text-[15px] font-semibold text-ka-cream">
        Back to cart
      </Link>
    </section>
  );
}
