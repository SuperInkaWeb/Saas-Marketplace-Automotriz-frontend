"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../lib/api";
import { getEmailFromToken, type AppRole } from "../../lib/jwt";
import { clearSession, getToken } from "../../lib/session";

type AdminUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function parseApiStatus(err: unknown): number | null {
  if (!(err instanceof Error)) return null;
  const match = err.message.match(/API error (\d{3})/);
  return match ? Number(match[1]) : null;
}

function normalizeRoleLabel(role: string | null | undefined) {
  if (!role) return "-";
  return role.toUpperCase().replace(/^ROLE_/, "");
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M14 16H9m10 0h-2M5 16H3" />
          <path d="M19 16v-3a2 2 0 0 0-2-2h-3l-1-2H7L6 11H4a2 2 0 0 0-2 2v3" />
          <circle cx="7.5" cy="16.5" r="1.5" />
          <circle cx="16.5" cy="16.5" r="1.5" />
        </svg>
      </div>
      <div className="text-xl font-semibold tracking-tight text-white">AutoManage</div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "mx-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
        active ? "bg-orange-500 text-white" : "text-white/85 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function StatCard({
  title,
  value,
  helper,
  tone,
  icon,
}: {
  title: string;
  value: string;
  helper?: string;
  tone: "blue" | "orange" | "green" | "red";
  icon: React.ReactNode;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
  } as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{value}</div>
          {helper ? <div className="mt-2 text-sm text-slate-500">{helper}</div> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [token, setTokenState] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const totals = useMemo(() => {
    const total = users.length;
    const byRole = users.reduce(
      (acc, u) => {
        const r = normalizeRoleLabel(u.role);
        acc[r] = (acc[r] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return { total, byRole };
  }, [users]);

  useEffect(() => {
    const storedToken = getToken();
    setTokenState(storedToken);
    setEmail(storedToken ? getEmailFromToken(storedToken) : null);
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<AdminUser[]>("/admin/users", { token });
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        const status = parseApiStatus(err);
        if (!cancelled) {
          if (status === 401) {
            clearSession();
            router.replace("/login");
            return;
          }
          if (status === 403) {
            router.replace("/admin");
            return;
          }
          setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, sessionChecked, token]);

  const updateRole = async (userId: number, newRole: AppRole) => {
    if (!token) return;
    try {
      setBusyUserId(userId);
      await apiFetch(`/admin/users/${userId}/role?role=${encodeURIComponent(newRole)}`, {
        method: "PUT",
        token,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el rol");
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!token) return;
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      setBusyUserId(userId);
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE", token });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el usuario");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col bg-blue-900 lg:flex">
          <Brand />

          <nav className="mt-2 space-y-2">
            <NavItem
              href="/admin"
              label="Inicio"
              active
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
            />
            <NavItem
              href="#usuarios"
              label="Usuarios"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <NavItem
              href="/dashboard"
              label="Dashboard"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              }
            />
          </nav>

          <div className="mt-auto border-t border-white/10 px-6 py-5 text-sm text-white/70">
            <div className="font-medium text-white/80">Sesión</div>
            <div className="mt-1 truncate">{email ?? "—"}</div>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 lg:px-10">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="Buscar..."
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm"
                aria-label="Notificaciones"
              >
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-600"
                >
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A2 2 0 0 0 4 17h16a2 2 0 0 0 .738-1.674C19.5 14.5 18 13 18 8a6 6 0 0 0-12 0c0 5-1.5 6.5-2.738 7.326" />
                </svg>
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
                  {(email?.[0] ?? "A").toUpperCase()}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-slate-900">Admin User</div>
                  <div className="text-xs text-slate-500">{email ?? "—"}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-500">Bienvenido al panel de control de AutoManage</p>
          </div>

          <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-4">
            <StatCard
              title="Total de usuarios"
              value={loading ? "..." : totals.total.toLocaleString("es-PE")}
              helper={`Admin: ${totals.byRole.ADMIN ?? 0} · Empresa: ${totals.byRole.EMPRESA ?? 0} · Cliente: ${totals.byRole.CLIENTE ?? 0}`}
              tone="blue"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <StatCard
              title="Empresas activas"
              value={loading ? "..." : String(totals.byRole.EMPRESA ?? 0)}
              helper="Cuentas registradas en el marketplace"
              tone="orange"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4 8 4v14" />
                  <path d="M9 9h1" />
                  <path d="M9 13h1" />
                  <path d="M9 17h1" />
                  <path d="M14 9h1" />
                  <path d="M14 13h1" />
                  <path d="M14 17h1" />
                </svg>
              }
            />
            <StatCard
              title="Clientes"
              value={loading ? "..." : String(totals.byRole.CLIENTE ?? 0)}
              helper="Usuarios finales registrados"
              tone="green"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <StatCard
              title="Alertas recientes"
              value="0"
              helper="Requieren atención"
              tone="red"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              }
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
              <div className="text-base font-semibold text-slate-900">Ventas mensuales</div>
              <div className="mt-6 h-56 w-full rounded-2xl bg-slate-50 p-4">
                <svg viewBox="0 0 100 60" className="h-full w-full">
                  <path
                    d="M0 50 L10 40 L20 35 L30 38 L40 28 L50 20 L60 26 L70 22 L80 18 L90 10 L100 14"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0 50 L10 40 L20 35 L30 38 L40 28 L50 20 L60 26 L70 22 L80 18 L90 10 L100 14 L100 60 L0 60 Z"
                    fill="rgba(249,115,22,0.12)"
                    stroke="none"
                  />
                </svg>
              </div>
              <div className="mt-3 text-sm text-slate-500">
                Placeholder visual (conecta métricas reales en Fase 2).
              </div>
            </div>

            <div
              id="usuarios"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">Usuarios</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Gestiona roles y accesos (ADMIN / EMPRESA / CLIENTE)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="rounded-xl border border-blue-900/20 bg-blue-900/5 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-900/10"
                >
                  Ver arriba
                </button>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">Nombre</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Rol</th>
                      <th className="px-4 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td className="px-4 py-6 text-slate-500" colSpan={5}>
                          Cargando...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-slate-500" colSpan={5}>
                          No hay usuarios.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="bg-white">
                          <td className="px-4 py-3 font-medium text-slate-900">{u.id}</td>
                          <td className="px-4 py-3 text-slate-700">{u.name ?? "-"}</td>
                          <td className="px-4 py-3 text-slate-700">{u.email ?? "-"}</td>
                          <td className="px-4 py-3">
                            <select
                              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm disabled:opacity-60"
                              value={normalizeRoleLabel(u.role)}
                              onChange={(e) => {
                                const value = e.target.value as AppRole | "-";
                                if (value === "-") return;
                                updateRole(u.id, value);
                              }}
                              disabled={busyUserId === u.id}
                            >
                              <option value="-" disabled>
                                Sin rol
                              </option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="EMPRESA">EMPRESA</option>
                              <option value="CLIENTE">CLIENTE</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => deleteUser(u.id)}
                              disabled={busyUserId === u.id}
                              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
