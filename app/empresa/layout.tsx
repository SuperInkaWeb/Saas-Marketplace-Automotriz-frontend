"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/session";
import { getEmailFromToken } from "../../lib/jwt";
import { apiFetch } from "../../lib/api";
import { Business } from "./shared";
import BusinessSetupForm from "./components/BusinessSetupForm";
import EmpresaSidebar from "./components/EmpresaSidebar";

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    setEmail(t ? getEmailFromToken(t) : null);
    if (!t) {
      router.replace("/login");
      return;
    }
    apiFetch<Business>("/business/me", { token: t })
      .then(biz => {
        setBusiness(biz);
        setNeedsSetup(false);
      })
      .catch(() => {
        setNeedsSetup(true);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (needsSetup && token) {
    return (
      <BusinessSetupForm
        token={token}
        onCreated={(biz) => {
          setBusiness(biz);
          setNeedsSetup(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <EmpresaSidebar business={business} email={email} />
        <main className="flex-1 min-w-0 px-5 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
