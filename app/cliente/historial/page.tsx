"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Booking, statusColor, statusLabel } from "../shared";

export default function ClienteHistorialPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const bookingData = await apiFetch<Booking[]>("/bookings/my", { token: t });
        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar historial");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const finishedBookings = bookings.filter(b => b.status === "COMPLETED" || b.status === "CANCELLED");

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Historial</h1>
          <p className="mt-0.5 text-sm text-slate-500">Todos tus servicios pasados</p>
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
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Servicio</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Negocio</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Hora</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">Cargando...</td></tr>
              ) : finishedBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-sm text-slate-400">No hay historial aún.</td></tr>
              ) : finishedBookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{b.serviceName ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.businessName ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.date ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.time ?? "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
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
