import { formatCurrency } from "@/lib/format";

/**
 * Selling price, then the struck-through MRP and "% off" when there's a
 * discount (the marketplace pattern). `discountPercent` comes from the
 * backend as stored - it's never worked out here. `className` sets the
 * selling price's size, weight and colour; the MRP and discount scale with it.
 */
export default function PriceTag({
  price,
  mrp,
  discountPercent,
  className = "text-lg font-bold text-ka-green",
}: {
  price: number;
  mrp?: number;
  discountPercent?: number;
  className?: string;
}) {
  const discounted = !!discountPercent && discountPercent > 0 && !!mrp && mrp > price;

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className="leading-none">{formatCurrency(price)}</span>
      {discounted && (
        <>
          <s className="text-[0.8em] font-normal leading-none text-ka-muted">
            <span className="sr-only">MRP </span>
            {formatCurrency(mrp ?? price)}
          </s>
          <span className="text-[0.8em] font-bold leading-none text-[#2E8B57]">{discountPercent}% off</span>
        </>
      )}
    </span>
  );
}
