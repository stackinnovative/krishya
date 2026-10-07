"use client";

import { getWhatsAppLink } from "@/lib/contact";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import { toStoreInfo, type StoreInfo } from "@/modules/settings/store-info";

/** Store info from Business Settings for client components, plus a WhatsApp link builder for the store's phone. */
export function useStoreContact(): StoreInfo & { whatsapp: (text?: string) => string } {
  const { data } = useSettings();
  const info = toStoreInfo(data?.data);
  return { ...info, whatsapp: (text?: string) => getWhatsAppLink(info.phone, text) };
}
