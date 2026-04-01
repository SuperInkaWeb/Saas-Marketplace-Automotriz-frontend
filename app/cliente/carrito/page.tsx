"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Cart } from "../shared";

export default function ClienteCarritoPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (!t) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const cartData = await apiFetch<Cart>("/cart", { token: t });
        setCart(cartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar carrito");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const removeCartItem = async (itemId: number) => {
    if (!token) return;
    try {
      const updated = await apiFetch<Cart>(`/cart/items/${itemId}`, { method: "DELETE", token });
      setCart(updated);
    } catch { setError("Error al eliminar item del carrito"); }
  };

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setCheckingOut(true);
      await apiFetch("/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({ address, phone, notes })
      });
      // Éxito: Redirigir a mis compras
      window.location.href = "/cliente/compras";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-6 text-slate-900">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Mi Carrito</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Gestiona los repuestos seleccionados antes de confirmar la compra</p>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-sm text-slate-400">
              <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
              Cargando productos...
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm">
              <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              <p className="text-lg font-bold text-slate-900">Tu carrito está vacío</p>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Parece que aún no has seleccionado piezas para tu vehículo.</p>
              <Link href="/business">
                <button type="button" className="px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/25">
                  Explorar Marketplace
                </button>
              </Link>
            </div>
          ) : cart.items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-between gap-4 hover:shadow-md transition">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{item.productName ?? "Producto"}</div>
                  <div className="text-sm text-slate-500 font-medium">Cantidad: <span className="text-blue-600 font-black">{item.quantity}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">S/ {(item.subtotal ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-slate-400 font-bold">S/ {(item.price ?? 0).toFixed(2)} c/u</div>
                </div>
                <button type="button" onClick={() => removeCartItem(item.id)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition border border-transparent hover:border-rose-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        {cart && cart.items.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 h-fit lg:sticky lg:top-6">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">Resumen de compra</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="text-slate-900">S/ {cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Descuento ({cart.discount}%)</span>
                  <span>- S/ {cart.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-slate-100 my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-500 uppercase text-xs">Total a pagar</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">S/ {cart.total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setCheckoutModal(true)}
              className="mt-8 w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-base hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group">
              Confirmar Pedido
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              SaaS Automotriz Secure Payment
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !checkingOut && setCheckoutModal(false)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white relative">
              <button onClick={() => setCheckoutModal(false)} className="absolute top-8 right-8 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <h2 className="text-2xl font-black mb-1">Finalizar Compra</h2>
              <p className="text-slate-400 text-sm">Rellena los datos para coordinar la entrega</p>
            </div>
            
            <form onSubmit={handleCheckout} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Dirección de Envío o Recojo</label>
                  <input 
                    required 
                    placeholder="Ej: Av. Principal 123 o 'Recojo en local'"
                    className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-slate-900 font-bold focus:border-blue-600 outline-none transition" 
                    value={address} onChange={e => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Teléfono de Contacto</label>
                  <input 
                    required 
                    placeholder="Tu celular para coordinar"
                    className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-slate-900 font-bold focus:border-blue-600 outline-none transition" 
                    value={phone} onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Notas Extra (Opcional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Instrucciones especiales para el vendedor..."
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-slate-900 font-medium focus:border-blue-600 outline-none transition resize-none" 
                    value={notes} onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={checkingOut}
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {checkingOut ? (
                    <><div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> Procesando...</>
                  ) : (
                    "Confirmar y Pagar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
