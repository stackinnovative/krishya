import { AtSign, Facebook, Globe, Instagram, Linkedin, Mail, MessageCircle, Music2, Pin, Send, Twitter, Youtube, type LucideIcon } from "lucide-react";

/** Mirrors backend/src/modules/settings/types/settings.type.ts SOCIAL_ICON_NAMES exactly. */
export const SOCIAL_ICON_NAMES = [
  "instagram",
  "facebook",
  "youtube",
  "x",
  "linkedin",
  "whatsapp",
  "telegram",
  "pinterest",
  "threads",
  "tiktok",
  "website",
  "email",
] as const;

export type SocialIconName = (typeof SOCIAL_ICON_NAMES)[number];

/** Mirrors backend MAX_SOCIAL_LINKS. */
export const MAX_SOCIAL_LINKS = 12;

export type SocialPlatform = {
  name: SocialIconName;
  /** Default label when the admin leaves the label blank. */
  title: string;
  Icon: LucideIcon;
  /** Brand colour - the admin picker and preview use it so each platform is recognisable at a glance. */
  color: string;
  placeholder: string;
};

/** lucide has no WhatsApp / TikTok / Threads / Telegram / Pinterest marks, so those use the closest generic glyph (chat, music, @, send, pin) in the brand's colour. */
export const SOCIAL_PLATFORMS: Record<SocialIconName, SocialPlatform> = {
  instagram: { name: "instagram", title: "Instagram", Icon: Instagram, color: "#E1306C", placeholder: "https://instagram.com/yourstore" },
  facebook: { name: "facebook", title: "Facebook", Icon: Facebook, color: "#1877F2", placeholder: "https://facebook.com/yourstore" },
  youtube: { name: "youtube", title: "YouTube", Icon: Youtube, color: "#FF0000", placeholder: "https://youtube.com/@yourstore" },
  x: { name: "x", title: "X (Twitter)", Icon: Twitter, color: "#111111", placeholder: "https://x.com/yourstore" },
  linkedin: { name: "linkedin", title: "LinkedIn", Icon: Linkedin, color: "#0A66C2", placeholder: "https://linkedin.com/company/yourstore" },
  whatsapp: { name: "whatsapp", title: "WhatsApp", Icon: MessageCircle, color: "#25D366", placeholder: "https://wa.me/919800000000" },
  telegram: { name: "telegram", title: "Telegram", Icon: Send, color: "#229ED9", placeholder: "https://t.me/yourstore" },
  pinterest: { name: "pinterest", title: "Pinterest", Icon: Pin, color: "#E60023", placeholder: "https://pinterest.com/yourstore" },
  threads: { name: "threads", title: "Threads", Icon: AtSign, color: "#000000", placeholder: "https://threads.net/@yourstore" },
  tiktok: { name: "tiktok", title: "TikTok", Icon: Music2, color: "#111111", placeholder: "https://tiktok.com/@yourstore" },
  website: { name: "website", title: "Website", Icon: Globe, color: "#1F4D3A", placeholder: "https://yourstore.com" },
  email: { name: "email", title: "Email", Icon: Mail, color: "#B8902F", placeholder: "mailto:hello@yourstore.com" },
};

export const SOCIAL_PLATFORM_OPTIONS: SocialPlatform[] = SOCIAL_ICON_NAMES.map((name) => SOCIAL_PLATFORMS[name]);

/** The visible name of a link: the admin's label, or the platform name when left blank. */
export const getSocialLinkLabel = (link: { icon: SocialIconName; label: string }) => link.label.trim() || SOCIAL_PLATFORMS[link.icon].title;

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:"];

/** Same rule as the backend DTO: a full http(s) link, or mailto: for email. Returns an error message, or null when valid. */
export const validateSocialUrl = (url: string): string | null => {
  const value = url.trim();
  if (!value) return "Link is required.";
  try {
    if (!ALLOWED_PROTOCOLS.includes(new URL(value).protocol)) return "Link must start with https:// (or mailto: for email).";
    return null;
  } catch {
    return "Enter a full link, e.g. https://instagram.com/yourstore";
  }
};
