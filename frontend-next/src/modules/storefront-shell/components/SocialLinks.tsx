import { getSocialLinkLabel, SOCIAL_PLATFORMS } from "@/modules/settings/constants/social-icons";
import type { SocialLink } from "@/modules/settings/types/settings.type";

type Variant = "footer" | "light";

const VARIANT_CLASS: Record<Variant, string> = {
  // Gold-ringed icons on the green footer.
  footer: "border border-ka-gold/45 text-ka-cream hover:border-ka-gold hover:bg-ka-gold hover:text-ka-green",
  // Sand chips on cream pages (contact page, mobile menu).
  light: "bg-ka-sand text-ka-green hover:bg-ka-green hover:text-ka-cream",
};

/**
 * The store's social media links from Business Settings, as round icon
 * buttons. Renders nothing when the admin hasn't added any. External links
 * open in a new tab; `mailto:` links open the mail app.
 */
export default function SocialLinks({ links, variant = "footer", className = "" }: { links: SocialLink[]; variant?: Variant; className?: string }) {
  if (links.length === 0) return null;

  return (
    <ul className={`m-0 flex list-none flex-wrap gap-2.5 p-0 ${className}`} aria-label="Social media">
      {links.map((link, i) => {
        const platform = SOCIAL_PLATFORMS[link.icon] ?? SOCIAL_PLATFORMS.website;
        const label = getSocialLinkLabel({ icon: platform.name, label: link.label });
        const external = !link.url.startsWith("mailto:");
        return (
          <li key={`${link.url}-${i}`}>
            <a
              href={link.url}
              aria-label={label}
              title={label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${VARIANT_CLASS[variant]}`}
            >
              <platform.Icon size={18} strokeWidth={1.7} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
