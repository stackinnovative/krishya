"use client";

import { useStoreContact } from "../hooks/useStoreContact";
import { CONTAINER, SectionDecor } from "./decor";
import { WhatsAppIcon, WhatsAppPhoneIcon } from "./icons";

/** "Need help choosing?" WhatsApp banner shown at the end of the home and FAQ pages. */
export default function WhatsAppCta() {
  const { whatsapp } = useStoreContact();

  return (
    <section className="relative isolate overflow-clip py-[clamp(40px,5vw,80px)]">
      <SectionDecor variant="d" />
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-ka-gold/35 bg-ka-sand p-[clamp(24px,4vw,56px)]">
          <div className="flex flex-[1_1_420px] items-center gap-5">
            <span className="grid h-[60px] w-[60px] flex-none place-items-center rounded-full bg-ka-cream text-ka-wa">
              <WhatsAppPhoneIcon size={28} strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.1] text-ka-green">Need help choosing? Chat with us on WhatsApp</span>
              <span className="text-[15px] text-ka-body">Our team replies from 9 AM to 7 PM, Monday to Saturday.</span>
            </div>
          </div>
          <a
            href={whatsapp("Hello, I need help choosing a product.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] items-center gap-2.5 whitespace-nowrap rounded-lg bg-ka-wa px-7 text-[15px] font-semibold text-white hover:bg-ka-wa-dark"
          >
            <WhatsAppIcon size={20} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
