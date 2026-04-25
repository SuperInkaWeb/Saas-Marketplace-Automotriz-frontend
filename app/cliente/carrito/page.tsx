"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Cart } from "../shared";

export default function ClienteCarritoPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para los items seleccionados
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (!t) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const cartData = await apiFetch<Cart>("/cart", { token: t });
        setCart(cartData);
        // Por defecto, seleccionar todos los productos
        if (cartData && cartData.items) {
          setSelectedIds(cartData.items.map(i => i.id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar carrito");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleItem = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!cart) return;
    if (selectedIds.length === cart.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.items.map(i => i.id));
    }
  };

  // Cálculos dinámicos basados en la selección
  const totals = useMemo(() => {
    if (!cart) return { subtotal: 0, discountAmount: 0, total: 0 };
    const selectedItems = cart.items.filter(item => selectedIds.includes(item.id));
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    // Aplicamos descuento si existe en el carrito
    const discountAmount = (subtotal * (cart.discount || 0)) / 100;
    return {
      subtotal,
      discountAmount,
      total: subtotal - discountAmount
    };
  }, [cart, selectedIds]);

  const removeCartItem = async (itemId: number) => {
    if (!token) return;
    try {
      const updated = await apiFetch<Cart>(`/cart/items/${itemId}`, { method: "DELETE", token });
      setCart(updated);
      setSelectedIds(prev => prev.filter(id => id !== itemId));
    } catch { setError("Error al eliminar item del carrito"); }
  };

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || selectedIds.length === 0) return;
    try {
      setCheckingOut(true);
      await apiFetch("/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({ 
          address, 
          phone, 
          notes,
          itemIds: selectedIds // Enviamos solo los seleccionados
        })
      });
      window.location.href = "/cliente/compras";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Mi Carrito</h1>
          <p className="mt-0.5 text-sm text-slate-500 font-medium max-w-lg">Gestiona y selecciona las piezas para tu vehículo.</p>
        </div>
        {cart && cart.items.length > 0 && (
          <button 
            onClick={toggleAll}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition border border-blue-100"
          >
            {selectedIds.length === cart.items.length ? "Desmarcar todos" : "Marcar todos"}
          </button>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/50 px-5 py-3 text-sm text-rose-700 flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-50 p-16 text-center text-sm text-slate-400 shadow-sm">
              <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
              <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Cargando...</p>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="bg-white rounded-[2rem] border-2 border-slate-50 p-16 text-center shadow-sm pt-20 pb-20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
               </div>
              <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto font-medium">Equipa tu vehículo con los mejores repuestos.</p>
              <Link href="/marketplace">
                <button type="button" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm">
                  Explorar Repuestos
                </button>
              </Link>
            </div>
          ) : cart.items.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className={`group bg-white rounded-2xl border-2 transition-all duration-300 p-5 flex items-center gap-5 cursor-pointer hover:shadow-md ${selectedIds.includes(item.id) ? 'border-blue-600/50 ring-2 ring-blue-50/50' : 'border-slate-50 shadow-sm opacity-80'}`}
            >
              {/* Checkbox Visual */}
              <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${selectedIds.includes(item.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-slate-50'}`}>
                {selectedIds.includes(item.id) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>

              <div className="flex-1 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${selectedIds.includes(item.id) ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 grayscale'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{item.productName ?? "Producto"}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md tracking-wider">Cant: {item.quantity}</span>
                       <span className="text-[10px] font-bold text-slate-400">@{item.businessName || "Tienda"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 tracking-tight">S/ {(item.subtotal ?? 0).toFixed(2)}</div>
                    <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">S/ {(item.price ?? 0).toFixed(2)} u.</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeCartItem(item.id); }}
                    className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition border border-slate-50 hover:border-rose-100 active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen Compacto */}
        {cart && cart.items.length > 0 && (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 h-fit lg:sticky lg:top-10 shadow-2xl shadow-slate-900/40 text-white relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-[10px] font-black text-blue-500 mb-6 uppercase tracking-[0.2em]">Resumen de compra</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                <span>Seleccionados</span>
                <span className="text-white bg-white/10 px-2 py-0.5 rounded-lg">{selectedIds.length} / {cart.items.length}</span>
              </div>
              
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-slate-400 text-xs font-bold">
                  <span>Subtotal</span>
                  <span className="text-white">S/ {totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs font-black">
                    <span>Descuento ({cart.discount}%)</span>
                    <span>- S/ {totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-2" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-blue-500 uppercase text-[9px] tracking-[0.3em]">Total a pagar</span>
                  <span className="text-3xl font-black text-white tracking-tighter">S/ {totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => setCheckoutModal(true)}
                className="mt-6 w-full py-4 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                Pagar Ahora
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              
              <div className="flex items-center justify-center gap-3 pt-4 mt-2 border-t border-white/5 opacity-40">
                <div className="text-[8px] font-black uppercase tracking-widest">Pago Seguro</div>
                <div className="h-1 w-1 bg-white/30 rounded-full" />
                <div className="text-[8px] font-black uppercase tracking-widest">Protección Vendedor</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal Modificado */}
      {checkoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !checkingOut && setCheckoutModal(false)} />
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="bg-slate-900 p-10 text-white relative">
              <button 
                onClick={() => setCheckoutModal(false)} 
                className="absolute top-10 right-10 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Datos Finales</h2>
              <p className="text-slate-400 font-medium">Estás comprando <span className="text-blue-500 font-bold">{selectedIds.length} items</span> por un total de <span className="text-white font-bold">S/ {totals.total.toFixed(2)}</span></p>
            </div>
            
            <form onSubmit={handleCheckout} className="p-10 pb-12 space-y-8">
              <div className="grid gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Dirección de Entrega</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <input 
                      required 
                      placeholder="Ej: Av. Las Américas 452, Cercado..."
                      className="w-full h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 pl-14 pr-6 text-slate-900 font-bold focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm group-hover:border-slate-200" 
                      value={address} onChange={e => setAddress(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">WhatsApp / Teléfono</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <input 
                      required 
                      placeholder="Para coordinar la entrega"
                      className="w-full h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 pl-14 pr-6 text-slate-900 font-bold focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm group-hover:border-slate-200" 
                      value={phone} onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Notas Especiales</label>
                  <textarea 
                    rows={2}
                    placeholder="¿Alguna instrucción extra?"
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none transition-all resize-none shadow-sm group-hover:border-slate-200" 
                    value={notes} onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={checkingOut}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] hover:bg-blue-500 transition shadow-2xl shadow-blue-600/30 text-xl flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 translate-y-2"
              >
                {checkingOut ? (
                  <><div className="h-6 w-6 border-4 border-white border-t-transparent animate-spin rounded-full" /> Procesando Pedido...</>
                ) : (
                  <>
                    Confirmar Compra
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
