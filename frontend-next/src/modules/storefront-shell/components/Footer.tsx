import Link from "next/link";
import { AYUSH_DISCLAIMER, AYUSH_LICENSE_NO, STORE_ADDRESS } from "@/lib/contact";
import { getStoreInfo } from "@/modules/settings/server";
import { getActiveCategories } from "@/modules/categories/server";
import { NAV_LINKS, POLICY_LINKS } from "../navigation";
import BrandLogo from "./BrandLogo";
import FooterWave from "./FooterWave";
import { SectionDecor } from "./decor";
import { LockIcon } from "./icons";
import SocialLinks from "./SocialLinks";

const LINK_CLASS = "self-start text-left text-sm text-ka-cream/80 transition-colors hover:text-ka-gold";
const HEADING_CLASS = "mb-1 text-xs font-bold tracking-[.2em] text-ka-gold";

export default async function Footer() {
  // Name, logo and contact details all come from Business Settings.
  const [store, categories] = await Promise.all([getStoreInfo(), getActiveCategories()]);
  const { storeName, logoUrl, email: contactEmail, phone: contactPhone } = store;

  return (
    <>
      <FooterWave />
      <footer className="relative isolate overflow-clip bg-ka-green text-sm text-ka-cream/80">
        <SectionDecor variant="a" dark />
        <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,56px)] pb-7 pt-[clamp(48px,6vw,88px)]">
          <div className="flex flex-wrap gap-x-[clamp(28px,3vw,44px)] gap-y-10">
            <div className="flex max-w-[340px] flex-[1_1_280px] flex-col gap-[18px]">
              <BrandLogo storeName={storeName} logoUrl={logoUrl} tone="dark" />
              <p className="m-0 leading-[1.7]">Rooted in Ayurveda, crafted for today. Classical Kerala preparations from the House of Cochin Arya Vaidyasala.</p>
              <SocialLinks links={store.socialLinks} />
            </div>

            <nav aria-label="Quick links" className="flex flex-[1_1_140px] flex-col gap-3">
              <span className={HEADING_CLASS}>QUICK LINKS</span>
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {categories.length > 0 && (
              <nav aria-label="Categories" className="flex flex-[1_1_160px] flex-col gap-3">
                <span className={HEADING_CLASS}>CATEGORIES</span>
                {categories.map((c) => (
                  <Link key={c.id} href={`/shop/${c.slug}`} className={LINK_CLASS}>
                    {c.name}
                  </Link>
                ))}
              </nav>
            )}

            <nav aria-label="Policies" className="flex flex-[1_1_160px] flex-col gap-3">
              <span className={HEADING_CLASS}>POLICIES</span>
              {POLICY_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-[1_1_220px] flex-col gap-3">
              <span className={HEADING_CLASS}>CONTACT</span>
              {contactPhone && (
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className={LINK_CLASS}>
                  {contactPhone}
                </a>
              )}
              <a href={`mailto:${contactEmail}`} className={`${LINK_CLASS} break-all`}>
                {contactEmail}
              </a>
              <span className="whitespace-pre-line leading-relaxed">{STORE_ADDRESS}</span>
            </div>
          </div>

          <div className="mt-[clamp(36px,4vw,56px)] flex flex-wrap items-baseline gap-x-8 gap-y-3 border-y border-ka-gold/45 py-6">
            {AYUSH_LICENSE_NO && <span className="text-[13px] font-semibold tracking-[.04em] text-ka-cream">AYUSH License No: {AYUSH_LICENSE_NO}</span>}
            <span className="flex-[1_1_420px] text-[12.5px] leading-relaxed text-ka-cream/70">{AYUSH_DISCLAIMER}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[18px] pt-6">
            <div className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
              <span className="grid h-7 place-items-center rounded-[5px] bg-ka-cream px-2.5 text-[11.5px] font-bold tracking-[.04em] text-ka-green">UPI</span>
              <span className="grid h-7 place-items-center rounded-[5px] bg-ka-cream px-2.5 text-xs font-extrabold italic text-[#1A1F71]">VISA</span>
              <span className="flex h-7 items-center rounded-[5px] bg-ka-cream px-2.5">
                <span className="h-3.5 w-3.5 rounded-full bg-[#E0412B]" />
                <span className="-ml-[5px] h-3.5 w-3.5 rounded-full bg-[#F2A33A] opacity-90" />
                <span className="ml-1.5 text-[10.5px] font-bold text-ka-ink">Mastercard</span>
              </span>
              <span className="grid h-7 place-items-center rounded-[5px] bg-ka-cream px-2.5 text-xs font-extrabold text-[#1F3F7A]">RuPay</span>
              <span className="ml-2 inline-flex h-7 items-center gap-1.5 rounded-[5px] border border-ka-gold/60 px-2.5 text-[11.5px] font-semibold text-ka-cream">
                <LockIcon size={13} strokeWidth={2} className="text-ka-gold" />
                SSL Secure Checkout
              </span>
            </div>
            <span className="text-[12.5px] text-ka-cream/70">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
