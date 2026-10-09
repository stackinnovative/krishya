"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type AdminBreadcrumb = {
  label: string;
  /** Omit on the last item - it's the page you're on. */
  href?: string;
};

/**
 * "Where am I / how do I get back" trail above the page title, for any admin
 * page below a module's list (e.g. Blog › Edit article). Pass it through
 * AdminPageShell's `breadcrumbs` prop.
 *
 * From the `om` breakpoint up it shows the full trail; on phones, where a
 * trail of tiny links is hard to tap, it collapses to one "‹ Parent" back
 * link to the nearest linked item.
 */
export default function AdminBreadcrumbs({ items }: { items: AdminBreadcrumb[] }) {
  const parent = [...items].reverse().find((item) => item.href);

  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      {parent?.href && (
        <Link
          href={parent.href}
          className="-ml-1 inline-flex h-8 max-w-full items-center gap-1 rounded-lg pr-2 pl-1 text-[13px] font-semibold text-[#555] hover:bg-white hover:text-[#141414] om:hidden"
        >
          <ChevronLeft size={16} className="flex-none" />
          <span className="truncate">{parent.label}</span>
        </Link>
      )}

      <ol className="m-0 hidden list-none items-center gap-1.5 p-0 text-[12.5px] om:flex">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={`flex min-w-0 items-center gap-1.5 ${last ? "" : "flex-none"}`}>
              {item.href && !last ? (
                <Link href={item.href} className="max-w-[220px] truncate font-semibold text-[#555] underline-offset-2 hover:text-[#141414] hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="max-w-[420px] truncate text-[#8a8a8e]">
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight size={13} className="flex-none text-[#b4b4b0]" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
