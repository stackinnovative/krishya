import { MAX_SOCIAL_LINKS, type PolicySection, type SettingsLogo, type SettingsProps, type SocialLink } from "../types/settings.type.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Single canonical set of defaults - the mongoose schema (infrastructure/settings.schema.ts)
 * imports this same object for its field defaults, so there is exactly one place
 * that defines "what a brand-new store looks like" instead of two copies drifting apart.
 */
export const SETTINGS_DEFAULTS: Omit<SettingsProps, "id"> = {
    storeName: "Artspace",
    email: "hello@artspaces.in",
    phone: "",
    logo: null,
    deliveryCharge: 60,
    freeAbove: 999,
    cod: true,
    maintenance: false,
    refundReturnSections: [
        {
            heading: "Replacement Available",
            icon: "Package",
            description: "We offer replacement only if the wrong item was delivered or the item arrived damaged during delivery.",
        },
        {
            heading: "Report Within 48 Hours",
            icon: "Clock",
            description: "Claims must be reported within 48 hours after delivery.",
        },
        {
            heading: "Unboxing Video Required",
            icon: "Video",
            description: "Please record an unboxing video before opening the package. This is required to verify damaged or incorrect items.",
        },
        {
            heading: "Claim Review",
            icon: "ShieldCheck",
            description: "Our team will review every claim before approving a replacement.",
        },
        {
            heading: "Shipping Charges",
            icon: "Truck",
            description: "If a claim is approved, we cover the return shipping cost and the shipping cost of the replacement item.",
        },
        {
            heading: "Refund Policy",
            icon: "Wallet",
            description: "We currently do not offer refunds. Approved claims will receive a replacement for the eligible product.",
        },
    ],
    privacyPolicySections: [
        {
            heading: "1. Introduction",
            icon: "FileText",
            description: "We respect your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you place an order through our website.",
        },
        {
            heading: "2. Information We Collect",
            icon: "HelpCircle",
            description: "When you place an order, we collect:\n\n- Full name\n- Email address\n- Phone number\n- Delivery address\n- Order details",
        },
        {
            heading: "3. Payments",
            icon: "CreditCard",
            description: "All payments are securely processed through Razorpay. We do not store your card, UPI, or banking details on our servers.",
        },
        {
            heading: "4. How We Use Your Information",
            icon: "CheckCircle",
            description: "Your information is used only to:\n\n- Process and deliver your order\n- Provide order updates\n- Respond to customer support inquiries\n\nWe do not sell, rent, or trade your personal information.",
        },
        {
            heading: "5. Data Security",
            icon: "ShieldCheck",
            description: "We take reasonable measures to protect your information. However, no online transmission can be guaranteed to be 100% secure.",
        },
        {
            heading: "6. Third-Party Services",
            icon: "AlertCircle",
            description: "We may use trusted third-party services such as Razorpay for payment processing. These providers have their own privacy policies governing the handling of your information.",
        },
        {
            heading: "7. Contact Us",
            icon: "Mail",
            description: "If you have any questions about this Privacy Policy, please contact us through the contact details provided on our website.",
        },
    ],
    socialLinks: [],
};

/**
 * Business settings is a singleton (one document for the whole store) - unlike the
 * other admin content modules (hero/banner/testimonial) there is no list, no
 * activate/deactivate, no delete. Every field here is the one source of truth every
 * other part of the app (pricing, storefront, emails, invoices) should read from
 * instead of hardcoding its own copy.
 */
export class Settings {
    public readonly id: string | null;
    public readonly storeName: string;
    public readonly email: string;
    public readonly phone: string;
    public readonly logo: SettingsLogo | null;
    public readonly deliveryCharge: number;
    public readonly freeAbove: number;
    public readonly cod: boolean;
    public readonly maintenance: boolean;
    public readonly refundReturnSections: PolicySection[];
    public readonly privacyPolicySections: PolicySection[];
    public readonly socialLinks: SocialLink[];

    constructor(props: SettingsProps) {
        const storeName = props.storeName.trim();
        const email = props.email.trim();
        const phone = props.phone?.trim() ?? "";

        if (!storeName || storeName.length < 2 || storeName.length > 100) {
            throw new Error("Store name must be between 2 and 100 characters");
        }

        if (!email || !EMAIL_RE.test(email)) {
            throw new Error("A valid support email is required");
        }

        if (props.deliveryCharge < 0) {
            throw new Error("Delivery charge cannot be negative");
        }

        if (props.freeAbove < 0) {
            throw new Error("Free delivery threshold cannot be negative");
        }

        if (props.logo && (!props.logo.url || !props.logo.publicId)) {
            throw new Error("Logo must have both a url and a publicId");
        }

        if (props.refundReturnSections.length > 20) {
            throw new Error("Refund/return policy cannot have more than 20 sections");
        }

        for (const section of props.refundReturnSections) {
            if (!section.heading.trim() || section.heading.length > 100) {
                throw new Error("Section heading must be between 1 and 100 characters");
            }
            if (!section.description.trim() || section.description.length > 1000) {
                throw new Error("Section description must be between 1 and 1000 characters");
            }
        }

        if (props.socialLinks.length > MAX_SOCIAL_LINKS) {
            throw new Error(`Cannot have more than ${MAX_SOCIAL_LINKS} social links`);
        }

        for (const link of props.socialLinks) {
            if (!link.url.trim()) {
                throw new Error("Every social link needs a URL");
            }
            if (link.label.length > 40) {
                throw new Error("Social link label cannot exceed 40 characters");
            }
        }

        if (props.privacyPolicySections.length > 20) {
            throw new Error("Privacy policy cannot have more than 20 sections");
        }

        for (const section of props.privacyPolicySections) {
            if (!section.heading.trim() || section.heading.length > 100) {
                throw new Error("Section heading must be between 1 and 100 characters");
            }
            if (!section.description.trim() || section.description.length > 1000) {
                throw new Error("Section description must be between 1 and 1000 characters");
            }
        }

        this.id = props.id ?? null;
        this.storeName = storeName;
        this.email = email;
        this.phone = phone;
        this.logo = props.logo ?? null;
        this.deliveryCharge = props.deliveryCharge;
        this.freeAbove = props.freeAbove;
        this.cod = props.cod;
        this.maintenance = props.maintenance;
        this.refundReturnSections = props.refundReturnSections.map((s) => ({
            heading: s.heading.trim(),
            icon: s.icon,
            description: s.description.trim(),
        }));
        this.privacyPolicySections = props.privacyPolicySections.map((s) => ({
            heading: s.heading.trim(),
            icon: s.icon,
            description: s.description.trim(),
        }));
        this.socialLinks = props.socialLinks.map((l) => ({ icon: l.icon, label: l.label.trim(), url: l.url.trim() }));
    }

    /** Delivery is waived once the subtotal clears freeAbove - freeAbove of 0 (or less)
     * means the free-delivery perk is switched off, so full delivery charge always applies. */
    calculateDeliveryCharge(subtotal: number): number {
        if (this.freeAbove > 0 && subtotal >= this.freeAbove) return 0;
        return this.deliveryCharge;
    }
}
