"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch } from "../../lib/api";
import { clearSession, getToken } from "../../lib/session";
import { getEmailFromToken } from "../../lib/jwt";

// ─── Types ────────────────────────────────────────────────────────────────────

type Business = {
  id: number;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  address?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
};

type Product = {
  id: number;
  name?: string | null;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  price?: number | null;
  stock?: number | null;
  photoUrl?: string | null;
  businessName?: string | null;
};

type Tab = "servicios" | "repuestos";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("servicios");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    setEmail(t ? getEmailFromToken(t) : null);
  }, []);

  // Load businesses
  useEffect(() => {
    (async () => {
      try {
        setLoadingBiz(true);
        const data = await apiFetch<Business[]>("/business/public");
        setBusinesses(Array.isArray(data) ? data : []);
      } catch {
        setBusinesses([]);
      } finally {
        setLoadingBiz(false);
      }
    })();
  }, []);

  // Load products
  useEffect(() => {
    (async () => {
      try {
        setLoadingProd(true);
        const data = await apiFetch<Product[]>("/products/search");
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProd(false);
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoadingBiz(true);
      const data = await apiFetch<Business[]>(`/business/search?query=${encodeURIComponent(searchQuery)}`);
      setBusinesses(Array.isArray(data) ? data : []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoadingBiz(false);
    }
  };

  const handleCategoryFilter = async (cat: string) => {
    setCategoryFilter(cat);
    try {
      setLoadingBiz(true);
      const url = cat ? `/business/public/filter?type=${encodeURIComponent(cat)}` : "/business/public";
      const data = await apiFetch<Business[]>(url);
      setBusinesses(Array.isArray(data) ? data : []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoadingBiz(false);
    }
  };

  const handleProductSearch = async (q: string) => {
    try {
      setLoadingProd(true);
      const url = q ? `/products/search?name=${encodeURIComponent(q)}` : "/products/search";
      const data = await apiFetch<Product[]>(url);
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProd(false);
    }
  };

  const addToCart = async (productId: number) => {
    if (!token) { router.push("/login"); return; }
    try {
      setAddingToCart(productId);
      await apiFetch("/cart/items", {
        method: "POST", token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setCartMsg("Producto agregado al carrito");
      setTimeout(() => setCartMsg(null), 2500);
    } catch {
      setCartMsg("Error al agregar al carrito");
      setTimeout(() => setCartMsg(null), 2500);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleLogout = () => { clearSession(); router.replace("/login"); };

  const categories = ["Taller", "Lubricentro", "Lavado", "Electricista", "Vulcanizadora"];
  const productCategories = ["aceites", "frenos", "baterías", "neumáticos", "filtros"];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M14 16H9m10 0h-2M5 16H3"/>
                  <path d="M19 16v-3a2 2 0 0 0-2-2h-3l-1-2H7L6 11H4a2 2 0 0 0-2 2v3"/>
                  <circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>
                </svg>
              </div>
              <span className="font-bold text-lg text-blue-900">AutoManage</span>
            </Link>

            <div className="flex items-center gap-3">
              {token ? (
                <>
                  <Link href="/cliente/dashboard">
                    <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      Mis Reservas
                    </button>
                  </Link>
                  <Link href="/cliente/dashboard">
                    <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                      {email?.split("@")[0]}
                    </button>
                  </Link>
                  <button type="button" onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                    </svg>
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button type="button" className="px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition">
                    Ingresar
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Search ── */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Encuentra el servicio automotriz perfecto
            </h1>
            <p className="text-xl text-blue-100">
              Compara precios, lee reseñas y reserva al instante
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3.5 text-gray-400">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="¿Qué servicio necesitas? (ej: taller, lavado...)"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <button type="button" onClick={handleSearch}
                className="px-6 h-12 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-400 transition">
                Buscar
              </button>
            </div>

            {/* Quick categories */}
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map(cat => (
                <button key={cat} type="button"
                  onClick={() => handleCategoryFilter(categoryFilter === cat ? "" : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${categoryFilter === cat ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cart toast ── */}
      {cartMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
          {cartMsg}
        </div>
      )}

      {/* ── Main Content ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
            <button type="button" onClick={() => setActiveTab("servicios")}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === "servicios" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
              Servicios
            </button>
            <button type="button" onClick={() => setActiveTab("repuestos")}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === "repuestos" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
              Repuestos
            </button>
          </div>
        </div>

        {/* ── TAB: Servicios ── */}
        {activeTab === "servicios" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Talleres y negocios</h2>
              <span className="text-sm text-gray-500">{businesses.length} resultados</span>
            </div>

            {loadingBiz ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-80 animate-pulse" />
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-slate-300 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/></svg>
                </div>
                <p className="text-gray-500">No se encontraron negocios</p>
                <button type="button" onClick={() => handleCategoryFilter("")}
                  className="mt-3 text-sm text-blue-600 hover:underline">Ver todos</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 relative overflow-hidden">
                      {b.photoUrl ? (
                        <img src={b.photoUrl} alt={b.name ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h-2M5 16H3"/><path d="M19 16v-3a2 2 0 0 0-2-2h-3l-1-2H7L6 11H4a2 2 0 0 0-2 2v3"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg>
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                        Disponible
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{b.name ?? "-"}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{b.category ?? "-"}</p>
                        </div>
                      </div>
                      {b.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{b.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {b.address ?? "Lima, Perú"}
                      </div>
                      <Link href={token ? `/cliente/dashboard` : `/login`}>
                        <button type="button"
                          className="w-full mt-4 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition">
                          <span className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            Reservar ahora
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB: Repuestos ── */}
        {activeTab === "repuestos" && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Repuestos y accesorios</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 text-gray-400">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                  <input
                    placeholder="Buscar repuesto..."
                    onChange={e => handleProductSearch(e.target.value)}
                    className="pl-9 pr-4 h-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  />
                </div>
                {token && (
                  <Link href="/cliente/dashboard">
                    <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                      Ver carrito
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button type="button" onClick={() => handleProductSearch("")}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                Todos
              </button>
              {productCategories.map(cat => (
                <button key={cat} type="button"
                  onClick={async () => {
                    setLoadingProd(true);
                    try {
                      const data = await apiFetch<Product[]>(`/products/search?category=${encodeURIComponent(cat)}`);
                      setProducts(Array.isArray(data) ? data : []);
                    } catch { setProducts([]); }
                    finally { setLoadingProd(false); }
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition capitalize">
                  {cat}
                </button>
              ))}
            </div>

            {loadingProd ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-slate-300 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                </div>
                <p className="text-gray-500">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden">
                    <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={p.name ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-200">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-slate-400 font-medium">{p.brand ?? "-"}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-2">{p.name}</p>
                      <p className="text-lg font-bold text-blue-900 mt-1">S/ {(p.price ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">Stock: {p.stock ?? 0}</p>
                      <button type="button" onClick={() => addToCart(p.id)}
                        disabled={addingToCart === p.id || (p.stock ?? 0) === 0}
                        className="w-full mt-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-400 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        {addingToCart === p.id ? "Agregando..." : (p.stock ?? 0) === 0 ? "Sin stock" : "Agregar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </section>
    </div>
  );
}