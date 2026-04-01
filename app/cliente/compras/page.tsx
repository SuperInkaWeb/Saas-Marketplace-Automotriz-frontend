"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Order } from "../shared";

export default function ClienteComprasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;

    apiFetch<Order[]>("/orders/my", { token: t })
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-700";
      case "PAID": return "bg-emerald-100 text-emerald-700";
      case "PREPARING": return "bg-blue-100 text-blue-700";
      case "SHIPPED": return "bg-indigo-100 text-indigo-700";
      case "READY_FOR_PICKUP": return "bg-purple-100 text-purple-700";
      case "DELIVERED": return "bg-slate-100 text-slate-600";
      case "CANCELLED": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Pendiente de Pago";
      case "PAID": return "Pagado / Confirmado";
      case "PREPARING": return "Preparando pedido";
      case "SHIPPED": return "En camino (Delivery)";
      case "READY_FOR_PICKUP": return "Listo para recoger";
      case "DELIVERED": return "Entregado";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Mis Compras</h1>
        <p className="mt-1 text-slate-500">Sigue el estado de tus piezas y repuestos adquiridos</p>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Aún no has comprado nada</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Explora el marketplace y equipa tu auto con los mejores repuestos.</p>
          <a href="/business" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
            Ir a comprar
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
              {/* Card Header */}
              <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Pedido #{order.id}</h3>
                      <p className="text-xs text-slate-500 font-medium">Vendido por <span className="text-blue-600 underline">@{order.businessName}</span> • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items comprados</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{item.quantity}x</span>
                            <span className="text-slate-600 font-medium">{item.productName}</span>
                          </div>
                          <span className="font-bold text-slate-900">S/ {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Total pagado</span>
                      <span className="text-xl font-black text-slate-900">S/ {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Entregar en:</p>
                          <p className="text-sm text-slate-700 font-semibold">{order.address || "Recojo en el taller del vendedor"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Contacto:</p>
                          <p className="text-sm text-slate-700 font-semibold">{order.phone}</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Tus notas:</p>
                            <p className="text-sm text-slate-500 italic">"{order.notes}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer / Stepper visual */}
              <div className="px-8 pb-8 flex items-center gap-1">
                {[ "PAID", "PREPARING", "SHIPPED", "DELIVERED" ].map((s, idx) => {
                  const states = [ "PAID", "PREPARING", "SHIPPED", "DELIVERED" ];
                  const currentIdx = states.indexOf(order.status);
                  const isDone = states.indexOf(s) <= currentIdx;
                  const isLast = idx === states.length - 1;
                  
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`h-2.5 w-2.5 rounded-full ${isDone ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-200'}`} />
                      {!isLast && <div className={`h-0.5 flex-1 mx-1 rounded-full ${isDone && states.indexOf(states[idx+1]) <= currentIdx ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
