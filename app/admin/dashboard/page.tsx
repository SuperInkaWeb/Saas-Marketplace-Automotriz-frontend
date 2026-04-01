"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getEmailFromToken } from "../../../lib/jwt";
import { clearSession, getToken } from "../../../lib/session";
import { AdminUser, AdminBusiness, KPIs, normalizeRoleLabel } from "../shared";
import { StatCard } from "../components/StatCard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyBizId, setBusyBizId] = useState<number | null>(null);

  const totals = useMemo(() => {
    const total = users.length;
    const byRole = users.reduce((acc, u) => {
      const r = normalizeRoleLabel(u.role);
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, byRole };
  }, [users]);

  useEffect(() => {
    const storedToken = getToken();
    setToken(storedToken);
    setEmail(storedToken ? getEmailFromToken(storedToken) : null);
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    if (!sessionChecked || !token) {
      if (sessionChecked && !token) router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setError(null);
        const [kpiData, userData, bizData] = await Promise.all([
          apiFetch<KPIs>("/admin/dashboard", { token }),
          apiFetch<AdminUser[]>("/admin/users", { token }),
          apiFetch<AdminBusiness[]>("/admin/businesses", { token }),
        ]);
        if (cancelled) return;
        setKpis(kpiData);
        setUsers(Array.isArray(userData) ? userData : []);
        setBusinesses(Array.isArray(bizData) ? bizData : []);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof Error && err.message.includes("401")) { clearSession(); router.replace("/login"); return; }
          if (err instanceof Error && err.message.includes("403")) { router.replace("/"); return; }
          setError(err instanceof Error ? err.message : "Error al cargar datos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, sessionChecked, token]);

  const moderateBiz = async (bizId: number, action: "approve" | "reject" | "block") => {
    if (!token) return;
    const labels = { approve: "aprobar", reject: "rechazar", block: "bloquear" };
    if (!confirm(`¿${labels[action]} este negocio?`)) return;
    try {
      setBusyBizId(bizId);
      await apiFetch(`/admin/businesses/${bizId}/${action}`, { method: "PUT", token });
      const newStatus = { approve: "APPROVED", reject: "REJECTED", block: "BLOCKED" }[action];
      setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, status: newStatus } : b));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al moderar negocio");
    } finally { setBusyBizId(null); }
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">KPIs globales de la plataforma</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {(email?.[0] ?? "A").toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-700">Admin</span>
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total usuarios" tone="blue"
          value={loading ? "—" : String(kpis?.totalUsuarios ?? totals.total)}
          helper={`Admin: ${totals.byRole.ADMIN ?? 0} · Empresa: ${kpis?.totalEmpresas ?? 0} · Cliente: ${kpis?.totalClientes ?? 0}`}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard title="Negocios" tone="orange"
          value={loading ? "—" : String(kpis?.totalNegocios ?? 0)}
          helper="Registrados en la plataforma"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/></svg>}
        />
        <StatCard title="Reservas" tone="green"
          value={loading ? "—" : String(kpis?.totalReservas ?? 0)}
          helper="Total en la plataforma"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
        />
        <StatCard title="Ingresos totales" tone="purple"
          value={loading ? "—" : `S/ ${(kpis?.ingresosTotales ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
          helper="De reservas completadas"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="text-sm font-semibold text-slate-900">Distribución de usuarios</div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Clientes", value: kpis?.totalClientes ?? 0, color: "bg-blue-500" },
              { label: "Empresas", value: kpis?.totalEmpresas ?? 0, color: "bg-orange-500" },
              { label: "Productos", value: kpis?.totalProductos ?? 0, color: "bg-violet-500" },
            ].map(item => {
              const total = (kpis?.totalUsuarios ?? 1);
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{item.label}</span><span>{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="text-sm font-semibold text-slate-900">Negocios pendientes de moderación</div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-400">Cargando...</p>
            ) : businesses.filter(b => b.status === "PENDING").length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                No hay negocios pendientes
              </div>
            ) : (
              businesses.filter(b => b.status === "PENDING").slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{b.name ?? "-"}</div>
                    <div className="text-xs text-slate-500 truncate">{b.category ?? "-"} · {b.address ?? "-"}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => moderateBiz(b.id, "approve")} disabled={busyBizId === b.id}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
                      Aprobar
                    </button>
                    <button type="button" onClick={() => moderateBiz(b.id, "reject")} disabled={busyBizId === b.id}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
            {businesses.filter(b => b.status === "PENDING").length > 4 && (
              <button type="button" onClick={() => router.push("/admin/negocios")}
                className="text-xs font-medium text-orange-600 hover:underline">
                Ver todos los pendientes &rarr;
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}