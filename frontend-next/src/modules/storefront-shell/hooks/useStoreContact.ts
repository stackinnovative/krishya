"use client";

import { CONTACT_EMAIL, CONTACT_PHONE, DEFAULT_STORE_NAME, getWhatsAppLink } from "@/lib/contact";
import { useSettings } from "@/modules/settings/hooks/useSettings";

/** Store name + contact details for client components: Business Settings first, env fallback second. */
export function useStoreContact() {
  const { data } = useSettings();
  const settings = data?.data;
  const phone = settings?.phone || CONTACT_PHONE;

  return {
    storeName: settings?.storeName || DEFAULT_STORE_NAME,
    email: settings?.email || CONTACT_EMAIL,
    phone,
    freeAbove: settings?.freeAbove ?? 0,
    whatsapp: (text?: string) => getWhatsAppLink(phone, text),
  };
}
