"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getEmailFromToken, type AppRole } from "../../../lib/jwt";
import { clearSession, getToken } from "../../../lib/session";
import { AdminUser, normalizeRoleLabel } from "../shared";

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

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
        const userData = await apiFetch<AdminUser[]>("/admin/users", { token });
        if (cancelled) return;
        setUsers(Array.isArray(userData) ? userData : []);
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

  const updateRole = async (userId: number, newRole: AppRole) => {
    if (!token) return;
    try {
      setBusyUserId(userId);
      await apiFetch(`/admin/users/${userId}/role?role=${encodeURIComponent(newRole)}`, { method: "PUT", token });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el rol");
    } finally { setBusyUserId(null); }
  };

  const deleteUser = async (userId: number) => {
    if (!token || !confirm("¿Eliminar este usuario?")) return;
    try {
      setBusyUserId(userId);
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE", token });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally { setBusyUserId(null); }
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usuarios</h1>
          <p className="mt-0.5 text-sm text-slate-500">Gestión de roles y accesos</p>
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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-sm text-center text-slate-400">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-sm text-center text-slate-400">No hay usuarios.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{u.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{u.name ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email ?? "-"}</td>
                  <td className="px-5 py-3.5">
                    <select className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 shadow-sm disabled:opacity-60"
                      value={normalizeRoleLabel(u.role)}
                      onChange={e => { const v = e.target.value as AppRole | "-"; if (v !== "-") updateRole(u.id, v); }}
                      disabled={busyUserId === u.id}>
                      <option value="-" disabled>Sin rol</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="EMPRESA">EMPRESA</option>
                      <option value="CLIENTE">CLIENTE</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button type="button" onClick={() => deleteUser(u.id)} disabled={busyUserId === u.id}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}