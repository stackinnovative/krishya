/**
 * The storefront's original help-centre questions, loaded once as the
 * starting content so the FAQ page is never empty on day one. The delivery
 * answer uses {delivery}, which the storefront fills from Business Settings.
 */
export const FAQ_SEED: { group: string; faqs: { question: string; answer: string; showOnHome?: boolean }[] }[] = [
    {
        group: "Orders & Delivery",
        faqs: [
            {
                question: "How long does delivery take?",
                answer: "Orders are dispatched within 1–2 working days. Delivery usually takes 2–4 days within Kerala and 4–7 days to the rest of India.",
                showOnHome: true,
            },
            { question: "Is delivery free?", answer: "{delivery}" },
            { question: "Do I need an account to order?", answer: "No. You can check out as a guest with just your name, phone number and delivery address.", showOnHome: true },
            { question: "How can I track my order?", answer: "We send order and shipping updates on WhatsApp and email, including a tracking link once your parcel is dispatched." },
            { question: "Do you deliver outside India?", answer: "At the moment we deliver only within India." },
        ],
    },
    {
        group: "Payments",
        faqs: [
            {
                question: "Which payment methods do you accept?",
                answer: "UPI (Google Pay, PhonePe, Paytm and others), credit and debit cards including RuPay, and net banking from all major banks.",
                showOnHome: true,
            },
            {
                question: "Is it safe to pay on your website?",
                answer: "Yes. Payments are processed by a certified payment partner over an encrypted connection. We never store your card details.",
            },
            { question: "Do you offer Cash on Delivery?", answer: "We currently accept prepaid orders only, which helps us dispatch faster." },
            {
                question: "My payment failed but money was deducted. What now?",
                answer: "Failed payments are usually reversed by your bank within 5–7 working days. Message us on WhatsApp with the transaction ID and we will help.",
            },
        ],
    },
    {
        group: "Products & Usage",
        faqs: [
            {
                question: "Are your products AYUSH licensed?",
                answer: "Yes. All products are manufactured under a valid AYUSH manufacturing licence, following classical Ayurvedic texts.",
                showOnHome: true,
            },
            {
                question: "How do I choose the right product?",
                answer: "Each product page describes its traditional uses and how to use it. For personal guidance, please consult a qualified Ayurvedic physician or chat with us on WhatsApp.",
            },
            {
                question: "Can I use more than one product together?",
                answer: "Many products are traditionally used together, but please check with an Ayurvedic physician, especially if you take other medicines.",
            },
            {
                question: "What is the shelf life?",
                answer: "Oils and churnams are best used within 2–3 years of manufacture. The manufacturing and expiry dates are printed on every pack.",
            },
            {
                question: "Are the products suitable during pregnancy?",
                answer: "Please consult your doctor or Ayurvedic physician before using any product during pregnancy or while breastfeeding.",
            },
        ],
    },
    {
        group: "Returns & Refunds",
        faqs: [
            {
                question: "Can I return a product?",
                answer: "Unopened products can be returned within 7 days of delivery. For hygiene reasons, opened products cannot be returned.",
                showOnHome: true,
            },
            { question: "What if my order arrives damaged?", answer: "Share a photo on WhatsApp within 48 hours of delivery and we will send a replacement at no extra cost." },
            { question: "How long do refunds take?", answer: "Approved refunds are processed to your original payment method within 5–7 working days." },
            { question: "How do I start a return?", answer: "Message us on WhatsApp or email with your order number and we will guide you through the steps." },
        ],
    },
];
