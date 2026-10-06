import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  Mail,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Mirrors backend/src/modules/settings/types/settings.type.ts POLICY_ICON_NAMES exactly. */
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

export const POLICY_ICON_MAP: Record<PolicyIconName, LucideIcon> = {
  Package,
  Clock,
  Video,
  ShieldCheck,
  Truck,
  Wallet,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Calendar,
  FileText,
  Star,
  Mail,
  Phone,
};

export const POLICY_ICON_OPTIONS: { name: PolicyIconName; Icon: LucideIcon }[] = POLICY_ICON_NAMES.map((name) => ({
  name,
  Icon: POLICY_ICON_MAP[name],
}));
