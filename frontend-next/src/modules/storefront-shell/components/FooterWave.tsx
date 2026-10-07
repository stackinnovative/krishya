"use client";

import { usePathname } from "next/navigation";
import { Wave } from "./decor";

/** The curve into the green footer starts from whatever colour the page ends on - mint after a product or article (their "related" strip), cream everywhere else. */
export default function FooterWave() {
  const pathname = usePathname();
  const endsMint = pathname.startsWith("/products/") || pathname.startsWith("/blog/");
  return <Wave from={endsMint ? "#E8F0E4" : "#FAF6EE"} to="#1F4D3A" />;
}
