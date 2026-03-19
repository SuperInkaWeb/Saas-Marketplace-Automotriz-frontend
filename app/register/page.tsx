"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { register } from "../../lib/auth";

type Role = "CLIENTE" | "NEGOCIO";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
};

type FieldErrors = Partial<Record<keyof RegisterForm, string>>;

function validate(form: RegisterForm): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) errors.name = "Nombre es obligatorio";

  const email = form.email.trim();
  if (!email) errors.email = "Email es obligatorio";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email inválido";

  if (!form.password) errors.password = "Contraseña es obligatoria";
  else if (form.password.length < 8)
    errors.password = "La contraseña debe tener al menos 8 caracteres";

  if (!form.role) errors.role = "Rol es obligatorio";

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CLIENTE",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const canSubmit = useMemo(() => !submitting, [submitting]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as RegisterForm));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      setSubmitting(true);
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone,
        role: form.role,
      });
      alert(`${data.message}. ID: ${data.userId}`);
      router.push("/login");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error en el registro");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/6 px-8 text-center text-white backdrop-blur"
      >
        <h1 className="mt-10 text-3xl font-medium">Sign up</h1>
        <p className="mt-2 text-sm text-gray-400">Create an account to continue</p>

        {submitError ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-left text-sm text-red-200">
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full bg-white/5 pl-6 ring-2 ring-white/10 transition-all focus-within:ring-indigo-500/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/60"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full border-none bg-transparent text-white placeholder-white/60 outline-none"
            value={form.name}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="name"
          />
        </div>
        {fieldErrors.name ? (
          <p className="mt-1 text-left text-xs text-red-200">{fieldErrors.name}</p>
        ) : null}

        <div className="mt-4 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full bg-white/5 pl-6 ring-2 ring-white/10 transition-all focus-within:ring-indigo-500/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/75"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>
          <input
            type="email"
            name="email"
            placeholder="Correo"
            className="w-full border-none bg-transparent text-white placeholder-white/60 outline-none"
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="email"
          />
        </div>
        {fieldErrors.email ? (
          <p className="mt-1 text-left text-xs text-red-200">{fieldErrors.email}</p>
        ) : null}

        <div className="mt-4 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full bg-white/5 pl-6 ring-2 ring-white/10 transition-all focus-within:ring-indigo-500/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/75"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border-none bg-transparent text-white placeholder-white/60 outline-none"
            value={form.password}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="new-password"
          />
        </div>
        {fieldErrors.password ? (
          <p className="mt-1 text-left text-xs text-red-200">{fieldErrors.password}</p>
        ) : null}

        <div className="mt-4 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full bg-white/5 pl-6 ring-2 ring-white/10 transition-all focus-within:ring-indigo-500/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/75"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92V19a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4 1h2.09a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L7.09 8.09a16 16 0 0 0 6 6l.9-1.09a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92Z" />
          </svg>
          <input
            type="text"
            name="phone"
            placeholder="Phone (optional)"
            className="w-full border-none bg-transparent text-white placeholder-white/60 outline-none"
            value={form.phone}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="tel"
          />
        </div>

        <div className="mt-4 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full bg-white/5 pl-6 ring-2 ring-white/10 transition-all focus-within:ring-indigo-500/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/75"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4 8 4v14" />
            <path d="M9 9h.01" />
            <path d="M15 9h.01" />
            <path d="M9 13h.01" />
            <path d="M15 13h.01" />
            <path d="M9 17h.01" />
            <path d="M15 17h.01" />
          </svg>
          <span className="text-sm text-white/70">Rol</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setForm((prev) => ({ ...prev, role: "CLIENTE" }));
              setFieldErrors((prev) => ({ ...prev, role: undefined }));
              setSubmitError(null);
            }}
            className={[
              "group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition",
              "bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/6",
              form.role === "CLIENTE"
                ? "ring-2 ring-indigo-500/60 border-indigo-500/40"
                : "ring-0",
              submitting ? "opacity-60" : "",
            ].join(" ")}
            aria-pressed={form.role === "CLIENTE"}
          >
            <div className="flex items-center gap-2">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border transition",
                  form.role === "CLIENTE"
                    ? "border-indigo-400/50 bg-indigo-500/15"
                    : "border-white/10 bg-white/5 group-hover:border-indigo-400/30",
                ].join(" ")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-white/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <span className="font-medium text-white">Cliente</span>
            </div>
            <span className="text-xs text-white/60">
              Cuenta personal para reservar y gestionar servicios.
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setForm((prev) => ({ ...prev, role: "NEGOCIO" }));
              setFieldErrors((prev) => ({ ...prev, role: undefined }));
              setSubmitError(null);
            }}
            className={[
              "group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition",
              "bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/6",
              form.role === "NEGOCIO"
                ? "ring-2 ring-indigo-500/60 border-indigo-500/40"
                : "ring-0",
              submitting ? "opacity-60" : "",
            ].join(" ")}
            aria-pressed={form.role === "NEGOCIO"}
          >
            <div className="flex items-center gap-2">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border transition",
                  form.role === "NEGOCIO"
                    ? "border-indigo-400/50 bg-indigo-500/15"
                    : "border-white/10 bg-white/5 group-hover:border-indigo-400/30",
                ].join(" ")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-white/80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4 8 4v14" />
                  <path d="M9 9h.01" />
                  <path d="M15 9h.01" />
                  <path d="M9 13h.01" />
                  <path d="M15 13h.01" />
                </svg>
              </div>
              <span className="font-medium text-white">Empresa</span>
            </div>
            <span className="text-xs text-white/60">
              Para talleres/tiendas que ofrecen servicios y gestionan citas.
            </span>
          </button>
        </div>
        {fieldErrors.role ? (
          <p className="mt-1 text-left text-xs text-red-200">{fieldErrors.role}</p>
        ) : null}

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        >
          <option value="CLIENTE">Cliente</option>
          <option value="NEGOCIO">Empresa</option>
        </select>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 h-11 w-full rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing up..." : "Sign up"}
        </button>

        <p className="mt-3 mb-11 text-sm text-gray-400">
          Already have an account?
          <Link href="/login" className="ml-1 text-indigo-400 hover:underline">
            click here
          </Link>
        </p>
      </form>

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-20 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-linear-to-tr from-indigo-800/35 to-transparent blur-3xl" />
        <div className="absolute bottom-10 right-12 h-[14rem] w-[26rem] rounded-full bg-linear-to-bl from-indigo-700/35 to-transparent blur-2xl" />
      </div>
    </div>
  );
}
