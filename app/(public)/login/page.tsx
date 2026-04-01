"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { login } from "../../../lib/auth";
import { getRoleFromToken } from "../../../lib/jwt";
import { setRole, setToken } from "../../../lib/session";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !submitting, [submitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() || !form.password) {
      setError("Email y contraseña son obligatorios");
      return;
    }

 try {
  setSubmitting(true);
  const data = await login(form.email.trim(), form.password);
  setToken(data.token);

  // temporal - solo para debug
console.log("PAYLOAD:", JSON.parse(atob(data.token.split(".")[1])));

  const role = getRoleFromToken(data.token);
  if (role) setRole(role);

  if (role === "ADMIN") {
    router.push("/admin");
  } else if (role === "EMPRESA") {
    router.push("/empresa/dashboard");
  } else {
    router.push("/cliente/dashboard");
  }
} catch (err) {
  setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
} finally {
  setSubmitting(false);
}
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4">
      {/* Botón Volver */}
      <button 
        onClick={() => router.push("/")} 
        className="absolute top-8 left-8 group flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold z-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </div>
        Volver atrás
      </button>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/6 px-8 text-center text-white backdrop-blur"
      >
        <h1 className="mt-10 text-3xl font-medium">Login</h1>
        <p className="mt-2 text-sm text-gray-400">Please sign in to continue</p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-left text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full bg-white/5 pl-6 ring-2 ring-white/10 transition-all focus-within:ring-indigo-500/60">
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
            name="email"
            type="email"
            placeholder="Correo"
            className="w-full border-none bg-transparent text-white placeholder-white/60 outline-none"
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="email"
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
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border-none bg-transparent text-white placeholder-white/60 outline-none"
            value={form.password}
            onChange={handleChange}
            disabled={submitting}
            autoComplete="current-password"
          />
        </div>

        <div className="mt-4 text-left">
          <button
            type="button"
            className="text-sm text-indigo-400 hover:underline"
            onClick={() => setError("Funcionalidad pendiente")}
            disabled={submitting}
          >
            Forget password?
          </button>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 h-11 w-full rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Ingresando..." : "Login"}
        </button>

        <p className="mt-3 mb-11 text-sm text-gray-400">
          Don&apos;t have an account?
          <Link href="/register" className="ml-1 text-indigo-400 hover:underline">
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
