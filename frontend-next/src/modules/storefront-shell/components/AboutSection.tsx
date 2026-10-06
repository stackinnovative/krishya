/**
 * Generic "about the store" block. There's no admin module for this copy
 * (it's brand storytelling, not catalogue data) - as a template, replace
 * the paragraph below with the store's own story. Kept intentionally plain
 * so it drops into any storefront without extra config.
 */
export default function AboutSection({ storeName = "this store" }: { storeName?: string }) {
  return (
    <section id="about" className="section-tint px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-semibold">Our story</h2>
        <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: "var(--muted)" }}>
          Every piece at {storeName} is made with care, in small batches, by people who love the craft. We keep
          things simple: good materials, honest pricing, and delivery you can track from your door to ours.
        </p>
      </div>
    </section>
  );
}
