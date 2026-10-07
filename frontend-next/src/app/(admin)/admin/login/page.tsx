"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import FormField from "@/modules/admin-shell/components/FormField";
import { useAdminLogin } from "@/modules/auth/hooks/useAdminLogin";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { getApiErrorMessage } from "@/lib/errors";
import { DEFAULT_STORE_NAME } from "@/lib/contact";


export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync, isPending } = useAdminLogin();
  const { data: settingsRes } = useSettings();
  const settings = settingsRes?.data;
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await mutateAsync(form);
      const from = searchParams.get("from");
      if (from) router.replace(from);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Sign in failed. Please try again."));
      toast.error("Sign in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1d1d1f] px-4">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-7">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          {settings?.logo?.url ? (
            <span className="relative block h-8 w-8 flex-none overflow-hidden rounded-[9px]">
              <Image src={getOptimizedImageUrl(settings.logo.url, 64, 64)} alt={storeName} fill sizes="32px" className="object-cover" />
            </span>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#f7a072,#f8d77a_55%,#b5e36e)] text-sm font-extrabold text-[#1d1d1f]">
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-[16px] font-bold tracking-[.02em]">{storeName} Admin</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <FormField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(v) => set("email", v as string)}
            placeholder="admin@artspace.in"
            error={errors.email}
            autoComplete="username"
          />
          <FormField
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(v) => set("password", v as string)}
            placeholder="••••••••"
            error={errors.password}
            autoComplete="current-password"
          />

          {formError && <p className="text-xs font-medium text-[#d6432f]">{formError}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-full bg-[#141414] px-5 py-3 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
