/** Help-centre questions from the Krishay design, grouped as on the FAQ page. */
export type Faq = { q: string; a: string };
export type FaqGroup = { group: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    group: "Orders & Delivery",
    items: [
      { q: "How long does delivery take?", a: "Orders are dispatched within 1–2 working days. Delivery usually takes 2–4 days within Kerala and 4–7 days to the rest of India." },
      { q: "Is delivery free?", a: "Delivery is free on orders above the free-delivery amount shown in your cart. A small flat delivery charge applies to smaller orders." },
      { q: "Do I need an account to order?", a: "No. You can check out as a guest with just your name, phone number and delivery address." },
      { q: "How can I track my order?", a: "We send order and shipping updates on WhatsApp and email, including a tracking link once your parcel is dispatched." },
      { q: "Do you deliver outside India?", a: "At the moment we deliver only within India." },
    ],
  },
  {
    group: "Payments",
    items: [
      { q: "Which payment methods do you accept?", a: "UPI (Google Pay, PhonePe, Paytm and others), credit and debit cards including RuPay, and net banking from all major banks." },
      { q: "Is it safe to pay on your website?", a: "Yes. Payments are processed by a certified payment partner over an encrypted connection. We never store your card details." },
      { q: "Do you offer Cash on Delivery?", a: "We currently accept prepaid orders only, which helps us dispatch faster." },
      {
        q: "My payment failed but money was deducted. What now?",
        a: "Failed payments are usually reversed by your bank within 5–7 working days. Message us on WhatsApp with the transaction ID and we will help.",
      },
    ],
  },
  {
    group: "Products & Usage",
    items: [
      { q: "Are your products AYUSH licensed?", a: "Yes. All products are manufactured under a valid AYUSH manufacturing licence, following classical Ayurvedic texts." },
      {
        q: "How do I choose the right product?",
        a: "Each product page describes its traditional uses and how to use it. For personal guidance, please consult a qualified Ayurvedic physician or chat with us on WhatsApp.",
      },
      {
        q: "Can I use more than one product together?",
        a: "Many products are traditionally used together, but please check with an Ayurvedic physician, especially if you take other medicines.",
      },
      { q: "What is the shelf life?", a: "Oils and churnams are best used within 2–3 years of manufacture. The manufacturing and expiry dates are printed on every pack." },
      { q: "Are the products suitable during pregnancy?", a: "Please consult your doctor or Ayurvedic physician before using any product during pregnancy or while breastfeeding." },
    ],
  },
  {
    group: "Returns & Refunds",
    items: [
      { q: "Can I return a product?", a: "Unopened products can be returned within 7 days of delivery. For hygiene reasons, opened products cannot be returned." },
      { q: "What if my order arrives damaged?", a: "Share a photo on WhatsApp within 48 hours of delivery and we will send a replacement at no extra cost." },
      { q: "How long do refunds take?", a: "Approved refunds are processed to your original payment method within 5–7 working days." },
      { q: "How do I start a return?", a: "Message us on WhatsApp or email with your order number and we will guide you through the steps." },
    ],
  },
];

const pick = (group: number, item: number): Faq => FAQ_GROUPS[group]!.items[item]!;

/** The five questions previewed on the home page. */
export const HOME_FAQS: Faq[] = [pick(0, 0), pick(0, 2), pick(1, 0), pick(2, 0), pick(3, 0)];
