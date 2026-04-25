"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/session";
import { Product } from "../shared";

export default function EmpresaInventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formIgv, setFormIgv] = useState(false);
  const [adding, setAdding] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;


    const loadData = async () => {
      try {
        setLoading(true);
        // El frontend llama a /inventory, pero el backend tiene la ruta /api/products/my
        // Voy a verificar si /inventory existe o si debo cambiarlo a /products/my
        const productData = await apiFetch<Product[]>("/products/my", { token: t });
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar inventario");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormName(""); setFormCategory(""); setFormBrand(""); setFormPrice(""); setFormStock(""); setFormIgv(false);
    setPhoto(null); setPhotoPreview(null);
    setShowProductForm(false);
    setEditingId(null);
    setError(null);
  };

  const openForm = () => {
    resetForm();
    setShowProductForm(true);
  };

  const openEdit = (p: Product) => {
    setFormName(p.name || "");
    setFormCategory(p.category || "");
    setFormBrand(p.brand || "");
    setFormPrice(p.price?.toString() || "");
    setFormStock(p.stock?.toString() || "");
    setFormIgv(p.igv || false);
    setPhotoPreview(p.photoUrl || null);
    setPhoto(null);
    setEditingId(p.id);
    setShowProductForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = getToken();
    if (!t) return;
    try {
      setAdding(true);
      setError(null);
      
      const payload = {
        name: formName,
        category: formCategory,
        brand: formBrand,
        price: parseFloat(formPrice),
        stock: parseInt(formStock, 10),
        igv: formIgv,
      };

      let savedProduct;

      if (editingId) {
        // Actualizar
        savedProduct = await apiFetch<Product>(`/products/${editingId}`, {
          method: "PUT",
          token: t,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Crear
        savedProduct = await apiFetch<Product>("/products", {
          method: "POST",
          token: t,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Subir foto si interactuó (nueva foto elegida)
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        savedProduct = await apiFetch<Product>(`/products/${savedProduct.id}/photo`, {
          method: "PUT",
          token: t,
          body: formData,
        });
      }

      setProducts(prev => {
        if (editingId) {
          return prev.map(p => p.id === editingId ? savedProduct : p);
        }
        return [...prev, savedProduct];
      });

      resetForm();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
    } finally {
      setAdding(false);
    }
  };

  const deleteProduct = async (id: number) => {
    const t = getToken();
    if (!t || !confirm("¿Eliminar este producto del inventario?")) return;
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE", token: t });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      setError("No se pudo eliminar el producto");
    }
  };

  const lowStock = products.filter(p => (p.stock ?? 0) <= 5);

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventario</h1>
          <p className="mt-0.5 text-sm text-slate-500">Stock de repuestos y alertas</p>
        </div>
        <button type="button" onClick={showProductForm ? resetForm : openForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Nuevo Producto
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="space-y-6">
        {showProductForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                {editingId ? "Editar producto" : "Crear nuevo producto"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Nombre del Producto</label>
                  <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ej: Neumático Michelin 205/55R16"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Categoría</label>
                    <input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="NEUMATICOS"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Marca</label>
                    <input value={formBrand} onChange={e => setFormBrand(e.target.value)} placeholder="Michelin"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Precio (S/)</label>
                    <input required type="number" step="0.01" min="0" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0.00"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Stock Inicial</label>
                    <input required type="number" min="0" value={formStock} onChange={e => setFormStock(e.target.value)} placeholder="10"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Imagen Referencial</label>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      )}
                    </div>
                    <label className="flex-1">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <div className="h-11 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 hover:border-blue-200 cursor-pointer transition-all">
                        {photo ? "Imagen cargada" : "Seleccionar archivo"}
                      </div>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2 pl-1">
                    <input type="checkbox" checked={formIgv} onChange={e => setFormIgv(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-slate-300" />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Aplica IGV (18%)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-end pb-0.5">
                <button type="submit" disabled={adding}
                  className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-60">
                  {adding ? "Guardando..." : (editingId ? "Actualizar Producto" : "Registrar Producto")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {lowStock.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-4">
              <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-rose-800 font-bold text-sm mb-1">{lowStock.length} productos con stock crítico (≤5)</div>
                <div className="flex flex-wrap gap-2">
                  {lowStock.map(p => (
                    <span key={p.id} className="text-[10px] font-black uppercase tracking-wide bg-white/50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200/50">
                      {p.name} ({p.stock})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Producto</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría / Marca</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Precio Unit.</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Existencias</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 px-2">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-sm text-slate-400 text-center">Analizando inventario...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-sm text-slate-400 text-center">No hay productos registrados en tu inventario.</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt={p.name ?? "Producto"} className="w-full h-full object-cover" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300"><path d="m21 8-9-4-9 4"/><path d="m21 16-9 4-9-4"/><path d="m3 8 9 4 9-4"/><path d="M12 12v8"/></svg>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{p.category ?? "SIN CAT."}</span>
                        <span className="text-xs font-semibold text-slate-600">{p.brand ?? "Genérico"}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">S/ {(p.price ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-black ${(p.stock ?? 0) <= 5 ? "text-rose-600" : "text-slate-900"}`}>
                            {p.stock}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">u.</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${
                          (p.stock ?? 0) <= 5 
                            ? "bg-rose-50 text-rose-700 border-rose-100" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                          {(p.stock ?? 0) <= 5 ? "Stock Bajo" : "Disponible"}
                        </span>
                        {p.igv && (
                          <span className="block mt-1 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50/50 rounded inline-block px-1.5 border border-blue-100">
                            +IGV
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openEdit(p)} title="Editar producto"
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-transparent text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                          </button>
                          <button type="button" onClick={() => deleteProduct(p.id)} title="Eliminar producto"
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-transparent text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
