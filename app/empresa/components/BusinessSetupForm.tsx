"use client";
import { useState } from "react";
import { apiFetch } from "../../../lib/api";
import { Business } from "../shared";

const CATEGORIES = [
  "TALLER_MECANICO",
  "ELECTRICIDAD_AUTOMOTRIZ",
  "PINTURA_Y_CARROCERIA",
  "ALINEACION_Y_BALANCEO",
  "LAVADO_Y_DETAILING",
  "REPUESTOS",
  "NEUMATICOS",
  "OTRO",
];

function categoryLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function BusinessSetupForm({ token, onCreated }: { token: string; onCreated: (biz: Business) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) {
      setErr("Completa los campos obligatorios.");
      return;
    }
    try {
      setSaving(true);
      setErr(null);
      
      // 1. Crear el negocio
      const biz = await apiFetch<Business>("/business/me", {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, address, phone, description }),
      });

      // 2. Si hay foto, subirla
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        await apiFetch(`/business/me/photo`, {
          method: "PUT",
          token,
          body: formData,
        });
        // Refrescar datos del negocio si es necesario (la respuesta del upload devuelve el business con photoUrl)
      }

      onCreated(biz);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear el negocio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 shadow-2xl shadow-orange-500/40 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/>
              <path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
              <path d="M14 9h1"/><path d="M14 13h1"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Registra tu negocio</h1>
          <p className="mt-2 text-sm text-slate-400">
            Configura tu taller o empresa automotriz para empezar a gestionar reservas y clientes.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre del negocio <span className="text-orange-400">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} required className="w-full h-11 rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Categoría <span className="text-orange-400">*</span></label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-11 rounded-xl border border-white/10 bg-slate-800 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{categoryLabel(c)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dirección <span className="text-orange-400">*</span></label>
                <input value={address} onChange={e => setAddress(e.target.value)} required className="w-full h-11 rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teléfono <span className="text-orange-400">*</span></label>
                <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full h-11 rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cargar Imagen del Negocio</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  )}
                </div>
                <label className="flex-1">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <div className="h-11 flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-xs font-medium text-slate-400 hover:bg-white/8 hover:border-orange-400/50 cursor-pointer transition-all">
                    {photo ? photo.name : "Seleccionar imagen..."}
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descripción <span className="text-slate-500 font-normal">(opcional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 resize-none" />
            </div>

            {err && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{err}</div>
            )}
            <button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 disabled:opacity-60 transition shadow-lg shadow-orange-500/30">
              {saving ? "Registrando..." : "Registrar mi negocio →"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Tu negocio quedará en estado <span className="text-amber-400 font-medium">Pendiente</span> hasta que un administrador lo apruebe.
          </p>
        </div>
      </div>
    </div>
  );
}
