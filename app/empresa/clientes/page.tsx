"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { ClientSummary } from "../shared";

export default function EmpresaClientesPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const clientData = await apiFetch<ClientSummary[]>("/crm/clients", { token: t });
        setClients(Array.isArray(clientData) ? clientData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clientes (CRM)</h1>
          <p className="mt-0.5 text-sm text-slate-500">Historial y datos de clientes</p>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Teléfono</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Reservas</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Última visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">Cargando...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">No hay clientes aún.</td></tr>
              ) : clients.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{c.name ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.email ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.phone ?? "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700">
                      {c.totalReservas ?? 0} reservas
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {c.ultimaVisita ? new Date(c.ultimaVisita).toLocaleDateString("es-PE") : "-"}
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
