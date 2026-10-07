"use client";

import { useState } from "react";
import { STORE_ADDRESS } from "@/lib/contact";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { CheckIcon, MapPinIcon, WhatsAppIcon } from "@/modules/storefront-shell/components/icons";

const inputClass = "h-12 w-full rounded-lg border border-ka-line bg-ka-cream px-3.5 text-[15px] font-normal text-ka-ink outline-none focus:border-ka-sage focus:ring-2 focus:ring-ka-sage/40";
const labelClass = "flex flex-col gap-1.5 text-[13px] font-semibold text-ka-green";
const EMPTY = { name: "", phone: "", email: "", message: "" };

/**
 * Contact form + details. There's no contact-message endpoint, so "Send"
 * hands the composed message to the store's WhatsApp (the channel the design
 * pushes everywhere) instead of pretending to submit it somewhere.
 */
export default function ContactPanel() {
  const { email, phone, whatsapp } = useStoreContact();
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = [`Hello, this is ${form.name}.`, form.message, `Phone: ${form.phone}`, form.email ? `Email: ${form.email}` : ""].filter(Boolean).join("\n");
    window.open(whatsapp(text), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const card = "flex flex-col gap-1 rounded-xl bg-ka-sand p-5";
  const cardLabel = "text-xs font-bold tracking-[.16em] text-ka-muted";

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,4vw,56px)]">
      <div className="rounded-xl border border-ka-sand bg-white p-[clamp(22px,3vw,36px)]">
        {sent ? (
          <div className="flex flex-col items-center gap-3.5 py-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ka-mint text-ka-green">
              <CheckIcon size={28} strokeWidth={1.8} />
            </span>
            <span className="font-display text-[28px] text-ka-green">Thank you, we&apos;ll be in touch</span>
            <span className="text-[15px] text-ka-body">Send the message in WhatsApp and we usually reply within one working day.</span>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY);
                setSent(false);
              }}
              className="border-b border-ka-gold pb-[3px] text-sm font-semibold text-ka-green"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <span className="font-display text-[26px] font-semibold text-ka-green">Send a message</span>
            <label className={labelClass}>
              Name
              <input required autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
            </label>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <label className={labelClass}>
                Phone
                <input required type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
              </label>
              <label className={labelClass}>
                Email
                <input type="email" autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
              </label>
            </div>
            <label className={labelClass}>
              Message
              <textarea required rows={5} value={form.message} onChange={set("message")} className={`${inputClass} h-auto resize-y py-3`} />
            </label>
            <button type="submit" className="h-[52px] rounded-lg bg-ka-green text-[15px] font-semibold text-ka-cream hover:bg-ka-green-dark">
              Send Message
            </button>
            <span className="text-center text-[12.5px] text-ka-muted">Opens WhatsApp with your message ready to send.</span>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-[18px]">
        <a
          href={whatsapp()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2.5 rounded-[10px] bg-ka-wa text-[15.5px] font-semibold text-white hover:bg-ka-wa-dark"
        >
          <WhatsAppIcon size={20} />
          Chat with us on WhatsApp
        </a>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {phone && (
            <div className={card}>
              <span className={cardLabel}>PHONE</span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-base font-semibold text-ka-green">
                {phone}
              </a>
            </div>
          )}
          <div className={card}>
            <span className={cardLabel}>EMAIL</span>
            <a href={`mailto:${email}`} className="break-all text-base font-semibold text-ka-green">
              {email}
            </a>
          </div>
          <div className={card}>
            <span className={cardLabel}>ADDRESS</span>
            <span className="whitespace-pre-line text-[15px] leading-[1.55] text-ka-green">{STORE_ADDRESS}</span>
          </div>
          <div className={card}>
            <span className={cardLabel}>HOURS</span>
            <span className="text-[15px] leading-[1.55] text-ka-green">
              Mon – Sat, 9 AM – 7 PM
              <br />
              Sunday closed
            </span>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDRESS)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-[200px] place-items-center rounded-xl border border-ka-sage bg-ka-mint text-center sm:h-[260px]"
          style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(31,77,58,.045) 0 1px,transparent 1px 11px)" }}
        >
          <span className="flex flex-col items-center gap-2 text-ka-green">
            <MapPinIcon size={28} strokeWidth={1.5} />
            <span className="text-sm font-semibold">Open in Google Maps</span>
          </span>
        </a>
      </div>
    </div>
  );
}
