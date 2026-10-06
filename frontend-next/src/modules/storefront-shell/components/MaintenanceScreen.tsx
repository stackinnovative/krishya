import { Wrench } from "lucide-react";

export default function MaintenanceScreen({ storeName, email }: { storeName: string; email?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ background: "var(--bg)" }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
        <Wrench size={24} />
      </div>
      <h1 className="mt-5 font-serif text-2xl font-semibold sm:text-3xl">{storeName} is taking a short break</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed sm:text-base" style={{ color: "var(--muted)" }}>
        We&apos;re making some updates behind the scenes. Please check back shortly.
      </p>
      {email && (
        <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
          Need help now? Reach us at{" "}
          <a href={`mailto:${email}`} className="font-medium underline" style={{ color: "var(--accent-strong)" }}>
            {email}
          </a>
        </p>
      )}
    </div>
  );
}
