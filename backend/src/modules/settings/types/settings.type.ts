export type SettingsLogo = {
    url: string;
    publicId: string;
};

/**
 * Curated Lucide icon names an admin can pick for a refund/return policy
 * section. Kept as a fixed allow-list (rather than any string) so the
 * storefront can always resolve a section's icon to a real component.
 */
export const POLICY_ICON_NAMES = [
    "Package",
    "Clock",
    "Video",
    "ShieldCheck",
    "Truck",
    "Wallet",
    "RotateCcw",
    "CheckCircle",
    "AlertCircle",
    "HelpCircle",
    "CreditCard",
    "Calendar",
    "FileText",
    "Star",
    "Mail",
    "Phone",
] as const;

export type PolicyIconName = (typeof POLICY_ICON_NAMES)[number];

/**
 * Platforms an admin can pick for a social media link. A fixed allow-list
 * (like POLICY_ICON_NAMES) so the storefront can always map a link to a
 * real icon instead of trusting an arbitrary string.
 */
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

export const MAX_SOCIAL_LINKS = 12;

export type SocialLink = {
    icon: SocialIconName;
    label: string;
    url: string;
};

export type PolicySection = {
    heading: string;
    icon: PolicyIconName;
    description: string;
};

export type SettingsProps = {
    id?: string | null;
    storeName: string;
    email: string;
    phone: string;
    logo?: SettingsLogo | null;
    deliveryCharge: number;
    freeAbove: number;
    cod: boolean;
    maintenance: boolean;
    refundReturnSections: PolicySection[];
    privacyPolicySections: PolicySection[];
    socialLinks: SocialLink[];
};

export type SettingsView = {
    id: string;
    storeName: string;
    email: string;
    phone: string;
    logo: SettingsLogo | null;
    deliveryCharge: number;
    freeAbove: number;
    cod: boolean;
    maintenance: boolean;
    refundReturnSections: PolicySection[];
    privacyPolicySections: PolicySection[];
    socialLinks: SocialLink[];
};
