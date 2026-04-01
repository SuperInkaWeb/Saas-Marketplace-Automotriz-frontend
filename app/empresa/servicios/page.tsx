"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Service } from "../shared";

export default function EmpresaServiciosPage() {
  const [token, setToken] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcDuration, setSvcDuration] = useState("");
  const [savingSvc, setSavingSvc] = useState(false);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (!t) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const svcData = await apiFetch<Service[]>("/services", { token: t });
        setServices(Array.isArray(svcData) ? svcData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar servicios");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const deleteService = async (id: number) => {
    if (!token || !confirm("¿Eliminar este servicio?")) return;
    try {
      await apiFetch(`/services/${id}`, { method: "DELETE", token });
      setServices(prev => prev.filter(s => s.id !== id));
    } catch { setError("No se pudo eliminar"); }
  };

  const createService = async () => {
    if (!token) return;
    try {
      setSavingSvc(true);
      const svc = await apiFetch<Service>("/services", {
        method: "POST", token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: svcName, description: svcDesc, price: Number(svcPrice), duration: Number(svcDuration) }),
      });
      setServices(prev => [...prev, svc]);
      setShowServiceForm(false);
      setSvcName(""); setSvcDesc(""); setSvcPrice(""); setSvcDuration("");
    } catch { setError("No se pudo crear el servicio"); }
    finally { setSavingSvc(false); }
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Servicios</h1>
          <p className="mt-0.5 text-sm text-slate-500">Administra tus servicios</p>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="space-y-4">
        <div className="flex justify-end">
          <button type="button" onClick={() => setShowServiceForm(!showServiceForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Nuevo Servicio
          </button>
        </div>

        {showServiceForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Crear nuevo servicio</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nombre</label>
                <input value={svcName} onChange={e => setSvcName(e.target.value)}
                  placeholder="Ej: Cambio de aceite"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Precio (S/)</label>
                <input value={svcPrice} onChange={e => setSvcPrice(e.target.value)} type="number"
                  placeholder="0.00"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Duración (minutos)</label>
                <input value={svcDuration} onChange={e => setSvcDuration(e.target.value)} type="number"
                  placeholder="60"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Descripción</label>
                <input value={svcDesc} onChange={e => setSvcDesc(e.target.value)}
                  placeholder="Descripción del servicio"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={createService} disabled={savingSvc}
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 disabled:opacity-60 transition">
                {savingSvc ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" onClick={() => setShowServiceForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Servicio</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Descripción</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Precio</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Duración</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">Cargando...</td></tr>
                ) : services.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">No hay servicios.</td></tr>
                ) : services.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[200px] truncate">{s.description ?? "-"}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">S/ {(s.price ?? 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.duration} min</td>
                    <td className="px-5 py-3.5">
                      <button type="button" onClick={() => deleteService(s.id)}
                        title="Eliminar servicio"
                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-transparent text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}