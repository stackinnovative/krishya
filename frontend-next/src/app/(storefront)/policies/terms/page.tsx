import type { Metadata } from "next";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping with us.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default function TermsPage() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-center font-serif text-3xl font-semibold sm:text-4xl">Terms &amp; Conditions</h1>

        <div className="space-y-10 text-sm leading-relaxed sm:text-base">
          <Section title="1. Introduction">
            <p>
              Welcome to our store. We are a small online store selling handcrafted goods, operating within India.
              By accessing or purchasing from our website, you agree to comply with the following Terms &amp;
              Conditions.
            </p>
          </Section>

          <Section title="2. Business Information">
            <ul className="list-disc space-y-2 pl-6">
              <li>We operate as a small online store.</li>
              <li>We currently sell only within India.</li>
              <li>We do not offer international shipping.</li>
              <li>We sell handcrafted goods and gift items.</li>
            </ul>
          </Section>

          <Section title="3. Payments">
            <ul className="list-disc space-y-2 pl-6">
              <li>All payments are securely processed through Razorpay.</li>
              <li>Payment methods supported by Razorpay (UPI, Cards, etc.) are accepted.</li>
              <li>All orders are prepaid and confirmed only after successful payment.</li>
              <li>Orders will not be shipped without payment confirmation.</li>
            </ul>
          </Section>

          <Section title="4. Shipping Policy">
            <ul className="list-disc space-y-2 pl-6">
              <li>We ship across India through trusted courier partners.</li>
              <li>The courier used depends on your delivery location.</li>
              <li>Delivery timelines depend on the delivery partner.</li>
            </ul>
          </Section>

          <Section title="5. Exchange Policy (No Refunds)">
            <ul className="list-disc space-y-2 pl-6">
              <li>We do not offer refunds.</li>
              <li>We only allow exchanges within 2 days of delivery.</li>
              <li>Unboxing video is mandatory for any exchange request.</li>
              <li>The product must be unused and in original packaging.</li>
              <li>If the unboxing video is not provided, exchange requests will not be accepted.</li>
            </ul>
          </Section>

          <Section title="6. Order Cancellation">
            <ul className="list-disc space-y-2 pl-6">
              <li>Orders cannot be cancelled once confirmed.</li>
              <li>As all orders are prepaid, cancellation after confirmation is not permitted.</li>
            </ul>
          </Section>

          <Section title="7. Product Information & Liability">
            <ul className="list-disc space-y-2 pl-6">
              <li>Product images are for representation purposes only.</li>
              <li>Slight color variations may occur due to lighting or screen differences.</li>
              <li>We are not responsible for minor variations in color or appearance.</li>
            </ul>
          </Section>

          <Section title="8. Contact Information">
            <p>For any queries regarding orders or exchanges, contact us at:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Email: {CONTACT_EMAIL}</li>
              <li>WhatsApp: {CONTACT_PHONE}</li>
            </ul>
          </Section>

          <Section title="9. Acceptance of Terms">
            <p>
              By placing an order on our website, you acknowledge that you have read, understood, and agreed to
              these Terms &amp; Conditions.
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
