"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { getToken } from "../../../../lib/session";

// ─── Interfaces ─────────────────────────────────────────────────────────────

type Service = {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  photoUrl?: string;
};

type BusinessDetail = {
  id: number;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  photoUrl: string | null;
  description: string | null;
  services?: Service[];
  products?: Product[];
};

type PageProps = {
  params: Promise<{ id: string }>;
};

// ─── Componente Principal ───────────────────────────────────────────────────

export default function BusinessDetailPage({ params }: PageProps) {
  const router = useRouter();
  const token = getToken();
  const { id: businessId } = use(params);

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados interactivos
  const [activeTab, setActiveTab] = useState<"servicios" | "productos">("servicios");

  // Estado del modal de Reserva
  const [bookingModal, setBookingModal] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Estado para toast del carrito
  const [addingProduct, setAddingProduct] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 1. Cargar datos del negocio, servicios y productos
  useEffect(() => {
    let cancelled = false;
    const loadDetail = async () => {
      try {
        setLoading(true);
        // Hacemos las 3 peticiones en paralelo (Negocio, Servicios, Productos)
        const [bizData, srvData, prodData] = await Promise.all([
          apiFetch<any>(`/business/public/${businessId}`).catch(() => null),
          apiFetch<any[]>(`/services/public/business/${businessId}`).catch(() => []),
          apiFetch<any[]>(`/products/public/business/${businessId}`).catch(() => [])
        ]);

        if (!cancelled && bizData) {
          // Si el backend incluye duration en vez de durationMinutes, lo mapeamos:
          const mappedServices = srvData.map((s: any) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            durationMinutes: s.duration || s.durationMinutes || 60,
            description: s.description
          }));

          setBusiness({
            id: bizData.id ?? parseInt(businessId),
            name: bizData.name ?? "Negocio sin nombre",
            category: bizData.category ?? "TALLER",
            address: bizData.address ?? "Sin dirección",
            phone: bizData.phone,
            photoUrl: bizData.photoUrl,
            description: bizData.description,
            services: mappedServices,
            products: prodData, // Asumimos que la lista viene lista para mostrar
          });
        } else if (!cancelled) {
          setError("No pudimos cargar la información de este negocio.");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Error interno de conexión.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDetail();
    return () => { cancelled = true; };
  }, [businessId]);

  // Mostrar mensaje temporal (toast)
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 2. Acción: Agendar cita
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push("/login");
      return;
    }
    if (!bookingModal || !bookingDate || !bookingTime) return;

    try {
      setSubmittingBooking(true);
      await apiFetch("/bookings", {
        method: "POST",
        token,
        body: JSON.stringify({
          serviceId: bookingModal.id,
          date: bookingDate,
          time: bookingTime,
          notes: bookingNotes,
        }),
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingModal(null);
        showToast("¡Reserva confirmada con éxito!");
      }, 2500);
    } catch (err) {
      alert("Error al intentar hacer la reserva. Intenta de nuevo.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // 3. Acción: Añadir al carrito
  const handleAddToCart = async (product: Product) => {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setAddingProduct(product.id);
      await apiFetch("/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });
      showToast(`${product.name} agregado al carrito 🛒`);
    } catch (err) {
      alert("Error al añadir el producto al carrito.");
    } finally {
      setAddingProduct(null);
    }
  };

  const categoryLabel = (cat: string) => cat.replace(/_/g, " ").toUpperCase();

  // ─── Renderizado Loading & Error ───
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
          <p className="mt-4 text-slate-500 font-medium">Cargando perfil del taller...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops...</h2>
          <p className="text-slate-500 mb-6">{error || "Negocio no encontrado."}</p>
          <button onClick={() => router.back()} className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 transition">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ─── Interfaz Principal ───
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Toast Flotante */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-slate-700">
          <div className="h-8 w-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header Estilo Cover Dinámico */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-slate-900 overflow-hidden isolate">
        {business.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.photoUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-orange-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        {/* Botón Flotante Volver */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-8 left-4 md:left-8 group flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver
        </button>

        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-end gap-6">
            
            {/* Logo o Imagen del Negocio */}
            <div className="h-28 w-28 md:h-36 md:w-36 bg-white shrink-0 rounded-3xl shadow-2xl flex items-center justify-center p-1 border-4 border-slate-900/10 overflow-hidden">
              <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {business.photoUrl ? (
                  <img src={business.photoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-slate-300">
                    {business.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="bg-orange-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {categoryLabel(business.category)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> 
                  4.8 (120 Reseñas)
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                {business.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {business.address}
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {business.phone || "Sin teléfono"}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Contenido Pestañas */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Descripción corta */}
        <p className="text-slate-600 mb-8 max-w-3xl text-sm md:text-base leading-relaxed">
          {business.description || "Ofrecemos los mejores servicios automotrices con garantía y profesionalismo. Contamos con técnicos especializados para atender su vehículo con equipos de última generación."}
        </p>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit mb-8">
          <button 
            onClick={() => setActiveTab("servicios")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "servicios" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
          >
            Nuestros Servicios
          </button>
          <button 
            onClick={() => setActiveTab("productos")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "productos" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
          >
            Tienda / Repuestos
          </button>
        </div>

        {/* Tab: SERVICIOS */}
        {activeTab === "servicios" && (
          <div className="grid md:grid-cols-2 gap-4">
            {(!business.services || business.services.length === 0) ? (
              <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <h3 className="text-lg font-bold text-slate-700">Aún no hay servicios</h3>
                <p className="text-slate-500 mt-1">Este negocio maestro aún no ha publicado sus tarifas.</p>
              </div>
            ) : (
              business.services.map(svc => (
                <div key={svc.id} className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {svc.name}
                      </h3>
                      <div className="bg-emerald-50 text-emerald-700 font-black text-lg px-3 py-1 rounded-xl shrink-0">
                        S/ {svc.price.toFixed(2)}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                      {svc.description || "Servicio especializado brindado por mecánicos expertos con las mejores herramientas del mercado."}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Tiempo estimado: {svc.durationMinutes} min
                    </div>
                  </div>
                  <button 
                    onClick={() => setBookingModal(svc)}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-orange-600 transition-colors shadow-sm group-hover:shadow-orange-500/25"
                  >
                    Agendar Cita Ahora
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: PRODUCTOS */}
        {activeTab === "productos" && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {(!business.products || business.products.length === 0) ? (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <h3 className="text-lg font-bold text-slate-700">Tienda vacía</h3>
                <p className="text-slate-500 mt-1">Este local no vende repuestos físicamente o virtualmente.</p>
              </div>
            ) : (
              business.products.map(prod => (
                <div key={prod.id} className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col">
                  <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {prod.photoUrl ? (
                      <img src={prod.photoUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:scale-110 transition-transform duration-500"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    )}
                    {prod.stock < 5 && prod.stock > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                        Quedan {prod.stock}
                      </span>
                    )}
                  </div>
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm md:text-base leading-snug mb-2">
                      {prod.name}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                      <div className="font-black text-slate-900 md:text-lg">S/ {prod.price.toFixed(2)}</div>
                      <button 
                        onClick={() => handleAddToCart(prod)}
                        disabled={addingProduct === prod.id || prod.stock <= 0}
                        className="h-10 w-10 md:h-11 md:w-11 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {addingProduct === prod.id ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* MODAL DE RESERVA (Aparece sobre toda la pantalla) */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !bookingSuccess && !submittingBooking && setBookingModal(null)} />
          
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-slide-up">
            
            {/* Header Modal */}
            <div className="bg-slate-900 p-6 md:p-8 text-white relative">
              {!bookingSuccess && !submittingBooking && (
                <button onClick={() => setBookingModal(null)} className="absolute top-6 right-6 h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
              <div className="bg-orange-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                Programando cita
              </div>
              <h2 className="text-2xl font-bold pr-10">{bookingModal.name}</h2>
              <div className="flex items-center gap-4 mt-4 text-slate-300 text-sm">
                <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {bookingModal.durationMinutes} min</span>
                <span className="font-bold text-emerald-400">S/ {bookingModal.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Configurar Estado Reservando Success */}
            {bookingSuccess ? (
              <div className="p-10 text-center animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Reserva Confirmada!</h3>
                <p className="text-slate-500">Nos comunicaremos pronto para confirmar la hora exacta y prepararnos para recibirte.</p>
              </div>
            ) : (
              /* Cuerpo Modal - Formulario */
              <form onSubmit={handleBooking} className="p-6 md:p-8">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fecha (D/M/A)</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full h-12 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-slate-900 font-medium focus:border-orange-500 focus:ring-0 outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hora (Aprox)</label>
                      <input 
                        type="time" 
                        required 
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className="w-full h-12 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-slate-900 font-medium focus:border-orange-500 focus:ring-0 outline-none transition" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Detalles para el Especialista (Opcional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Ej: Mi auto hace un ruido raro al frenar..."
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-orange-500 focus:ring-0 outline-none transition resize-none" 
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  {!token && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl px-4 py-3 text-sm flex gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Serás redirigido para iniciar sesión y garantizar tu reserva de forma segura.
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={submittingBooking}
                    className="w-full bg-orange-500 text-white font-black py-4 rounded-xl hover:bg-orange-400 transition shadow-lg shadow-orange-500/30 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submittingBooking ? (
                      <><div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> Procesando...</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> Solicitar Cita</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
