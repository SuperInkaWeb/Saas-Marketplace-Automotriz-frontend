"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/session";
import { getEmailFromToken } from "../../lib/jwt";
import { apiFetch } from "../../lib/api";
import { UserProfile } from "./shared";
import ClienteSidebar from "./components/ClienteSidebar";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    setEmail(t ? getEmailFromToken(t) : null);
    if (!t) {
      router.replace("/login");
      return;
    }
    
    apiFetch<UserProfile>("/users/me", { token: t })
      .then(p => setProfile(p))
      .catch(() => {}) // non-critical
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <ClienteSidebar profile={profile} email={email} />
        <main className="flex-1 min-w-0 px-5 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
