import { EMAIL_PATTERN, type FieldRule } from "@/shared/form-validation";

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  acceptedTerms: boolean;
}

/** "+91 98765-43210", "098765 43210" -> "9876543210". Customers type their number every which way; the backend only takes the bare 10 digits. */
export const normalizeIndianPhone = (value: string): string => {
  const compact = value.replace(/[\s()-]/g, "");
  if (compact.startsWith("+91")) return compact.slice(3);
  if (/^91\d{10}$/.test(compact)) return compact.slice(2);
  if (/^0\d{10}$/.test(compact)) return compact.slice(1);
  return compact;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Same limits and formats as the backend's CreateOrderSchema, so a bad value is caught under its field instead of coming back as a 400. */
export const CHECKOUT_RULES: FieldRule<CheckoutForm>[] = [
  {
    key: "name",
    label: "Full name",
    required: true,
    minLength: 2,
    maxLength: 60,
    validate: (v) => (/^[A-Za-z\s.'-]+$/.test(str(v)) ? null : "Name can only contain letters, spaces and . ' -"),
  },
  {
    key: "phone",
    label: "Phone",
    required: true,
    validate: (v) => (/^[6-9]\d{9}$/.test(normalizeIndianPhone(str(v))) ? null : "Enter a valid 10-digit Indian mobile number."),
  },
  {
    key: "email",
    label: "Email",
    required: true,
    maxLength: 100,
    validate: (v) => (EMAIL_PATTERN.test(str(v)) ? null : "Enter a valid email address."),
  },
  {
    key: "pincode",
    label: "Pincode",
    required: true,
    validate: (v) => (/^[1-9]\d{5}$/.test(str(v)) ? null : "Enter a valid 6-digit pincode."),
  },
  { key: "addressLine1", label: "Address", required: true, minLength: 5, maxLength: 120 },
  { key: "addressLine2", label: "Landmark", maxLength: 120 },
  {
    key: "city",
    label: "City",
    required: true,
    minLength: 2,
    maxLength: 60,
    validate: (v) => (/^[A-Za-z\s.-]+$/.test(str(v)) ? null : "City can only contain letters, spaces, . and -"),
  },
  { key: "state", label: "State", required: true },
  {
    key: "acceptedTerms",
    label: "Terms",
    validate: (v) => (v === true ? null : "Please accept the terms and returns policy to continue."),
  },
];
