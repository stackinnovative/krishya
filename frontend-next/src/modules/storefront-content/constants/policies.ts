/**
 * Policy copy from the Krishay design. Returns and Privacy are editable in
 * admin (Business Settings) - these texts are only shown until those
 * sections are filled in. Shipping and Terms have no admin editor yet.
 */
export type PolicyKey = "shipping" | "returns" | "privacy" | "terms";
export type PolicyCopySection = { heading: string; body: string };

export const POLICY_TITLES: Record<PolicyKey, string> = {
  shipping: "Shipping Policy",
  returns: "Returns & Refunds Policy",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

export const POLICY_UPDATED_ON = "1 September 2026";

export const POLICY_COPY: Record<PolicyKey, PolicyCopySection[]> = {
  shipping: [
    { heading: "Where we deliver", body: "We deliver to all serviceable pincodes across India through trusted courier partners. You can confirm delivery to your pincode at checkout." },
    {
      heading: "Dispatch time",
      body: "Orders are packed and dispatched within 1–2 working days from our facility in Kerala. Orders placed on Sundays or public holidays are dispatched on the next working day.",
    },
    { heading: "Delivery time", body: "Delivery usually takes 2–4 working days within Kerala and 4–7 working days to other states. Remote locations may take a little longer." },
    { heading: "Delivery charges", body: "Delivery is free on orders above the free-delivery amount shown in your cart. Smaller orders carry a small flat delivery charge, shown before you pay." },
    { heading: "Order updates", body: "You will receive order confirmation, dispatch and tracking updates on WhatsApp and by email." },
  ],
  returns: [
    {
      heading: "Eligibility",
      body: "Unopened products in their original packaging can be returned within 7 days of delivery. For hygiene and safety reasons, opened or used products cannot be returned.",
    },
    {
      heading: "Damaged or incorrect items",
      body: "If your order arrives damaged or you receive the wrong item, please share a photo with us on WhatsApp or email within 48 hours of delivery. We will arrange a replacement at no cost.",
    },
    { heading: "How to request a return", body: "Message us with your order number and the reason for return. Our team will confirm eligibility and share pickup details." },
    { heading: "Refunds", body: "Once the returned product is received and checked, the refund is processed to your original payment method within 5–7 working days." },
  ],
  privacy: [
    {
      heading: "Information we collect",
      body: "When you place an order, we collect your name, phone number, email address and delivery address. We do not require you to create an account.",
    },
    { heading: "How we use it", body: "Your details are used only to process and deliver your order, send order updates on WhatsApp and email, and respond to your questions." },
    { heading: "Payments", body: "Payments are handled by a certified payment partner. We do not see or store your card, UPI or banking details." },
    { heading: "Your wishlist and cart", body: "Your wishlist and cart are linked to this device. Clearing your browser data will remove them." },
    { heading: "Contact", body: "For any privacy questions, write to us at the email address below." },
  ],
  terms: [
    { heading: "About these terms", body: "By using this website and placing an order, you agree to these terms. Please read them carefully." },
    {
      heading: "Product information",
      body: "Product descriptions reflect traditional Ayurvedic use and are for general information only. They are not a substitute for advice from a qualified Ayurvedic physician.",
    },
    {
      heading: "Pricing",
      body: "All prices are in Indian Rupees and include applicable taxes. Prices may change without notice, but you will always pay the price shown at checkout.",
    },
    {
      heading: "Orders",
      body: "We may cancel an order if a product is unavailable or if there is an error in pricing. In such cases, any amount paid will be refunded in full.",
    },
    { heading: "Payments", body: "All orders are prepaid and are confirmed only after successful payment through our certified payment partner." },
    { heading: "Governing law", body: "These terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts of Kochi, Kerala." },
  ],
};
