"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Booking, statusColor, statusLabel } from "../shared";

export default function EmpresaCitasPage() {
  const [token, setToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (!t) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const bookingData = await apiFetch<Booking[]>("/bookings/business", { token: t });
        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar citas");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const confirmBooking = async (id: number) => {
    if (!token) return;
    try {
      await apiFetch(`/bookings/${id}/confirm`, { method: "PUT", token });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CONFIRMED" } : b));
    } catch { setError("No se pudo confirmar"); }
  };

  const completeBooking = async (id: number) => {
    if (!token) return;
    try {
      await apiFetch(`/bookings/${id}/complete`, { method: "PUT", token });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "COMPLETED" } : b));
    } catch { setError("No se pudo completar"); }
  };

  const cancelBooking = async (id: number) => {
    if (!token || !confirm("¿Cancelar esta reserva?")) return;
    try {
      await apiFetch(`/bookings/${id}/cancel-business`, { method: "PUT", token });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
    } catch { setError("No se pudo cancelar"); }
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda de Citas</h1>
          <p className="mt-0.5 text-sm text-slate-500">Gestiona reservas y horarios</p>
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
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Hora</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Servicio</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Notas</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-sm text-slate-400">Cargando...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-sm text-slate-400">No hay reservas aún.</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-mono text-sm text-slate-700">{b.time ?? "-"}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{b.serviceName ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.date ?? "-"}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs max-w-[160px] truncate">{b.notes ?? "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {b.status === "PENDING" && (
                        <button type="button" onClick={() => confirmBooking(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition">
                          Confirmar
                        </button>
                      )}
                      {b.status === "CONFIRMED" && (
                        <button type="button" onClick={() => completeBooking(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition">
                          Completar
                        </button>
                      )}
                      {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                        <button type="button" onClick={() => cancelBooking(b.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                          Cancelar
                        </button>
                      )}
                    </div>
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
