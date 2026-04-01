"use client";

import Link from "next/link";
import PublicNavbar from "../components/ui/PublicNavbar";
import PublicFooter from "../components/ui/PublicFooter";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
    title: "Encuentra Talleres Cercanos",
    description: "Geolocalización en tiempo real para encontrar el servicio más cercano a ti.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
    title: "Reseñas y Calificaciones",
    description: "Lee opiniones reales de otros usuarios antes de elegir.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
    ),
    title: "Marketplace de Repuestos",
    description: "Compra repuestos originales y de calidad al mejor precio.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
    title: "Panel SaaS para Negocios",
    description: "Gestiona tu taller con CRM, inventario, citas y reportes.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    title: "Reservas Online",
    description: "Agenda tus servicios 24/7 sin necesidad de llamar.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    title: "Pagos Seguros",
    description: "Transacciones protegidas y procesamiento confiable.",
  },
];

const planes = [
  {
    nombre: "Básico",
    precio: "$29",
    descripcion: "Para talleres pequeños",
    caracteristicas: ["Perfil en marketplace", "Reseñas de clientes", "Geolocalización", "Reservas online", "5 usuarios"],
    destacado: false,
  },
  {
    nombre: "Profesional",
    precio: "$79",
    descripcion: "Para negocios en crecimiento",
    caracteristicas: ["Todo lo del plan Básico", "CRM de clientes", "Agenda y citas", "Control de servicios", "Dashboard de ventas", "15 usuarios"],
    destacado: true,
  },
  {
    nombre: "Premium",
    precio: "$149",
    descripcion: "Para talleres grandes",
    caracteristicas: ["Todo lo del plan Profesional", "ERP automotriz completo", "Inventario de repuestos", "Facturación electrónica", "Marketing automático", "Usuarios ilimitados"],
    destacado: false,
  },
];

const testimonials = [
  {
    name: "Carlos Rodríguez",
    role: "Dueño de Taller Mendoza",
    initials: "CR",
    text: "AutoManage triplicó nuestros clientes en 3 meses. El marketplace nos trajo visibilidad increíble.",
    rating: 5,
  },
  {
    name: "María González",
    role: "Cliente Frecuente",
    initials: "MG",
    text: "Ahora puedo comparar precios y ver reseñas antes de elegir. ¡Me encanta la plataforma!",
    rating: 5,
  },
  {
    name: "Jorge Martínez",
    role: "Gerente de Lubricentro Express",
    initials: "JM",
    text: "El CRM y la gestión de citas nos ahorra 10 horas semanales. Totalmente recomendado.",
    rating: 5,
  },
];

const stats = [
  { numero: "12,453", label: "Usuarios Activos" },
  { numero: "287", label: "Talleres Registrados" },
  { numero: "45K+", label: "Servicios Completados" },
  { numero: "4.8★", label: "Calificación Promedio" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <PublicNavbar />

      {/* ── Hero ── */}
      <section id="home" className="relative bg-gradient-to-br from-blue-900 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-orange-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                Plataforma #1 del ecosistema automotriz
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Gestiona tu negocio automotriz de manera profesional
              </h1>
              <p className="text-lg text-blue-100 max-w-lg">
                La plataforma todo-en-uno para talleres, lubricentros y lavados. Gestiona clientes, reservas, inventario y ventas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <button type="button" className="px-8 py-4 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-400 transition shadow-lg shadow-orange-500/30">
                    Comenzar gratis
                  </button>
                </Link>
                <a href="#funcionalidades">
                  <button type="button" className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition">
                    Ver Demo
                  </button>
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80"
                  alt="Taller automotriz"
                  className="w-full h-[420px] object-cover"
                />
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-5 py-4">
                <div className="text-2xl font-bold text-blue-900">287+</div>
                <div className="text-xs text-gray-500 font-medium">Talleres registrados</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-orange-500 rounded-2xl shadow-xl px-5 py-4 text-white">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-xs font-medium opacity-90">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-blue-900">{stat.numero}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Funcionalidades principales</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para administrar tu negocio automotriz de forma eficiente
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4 text-orange-500">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Miles de negocios confían en AutoManage para gestionar su operación
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-900 text-white font-bold text-lg">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="precios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Planes y Precios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra el plan que mejor se adapte a tus necesidades
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {planes.map((plan, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 border-2 transition hover:shadow-lg ${plan.destacado ? "border-orange-500 shadow-lg shadow-orange-100" : "border-gray-100"}`}>
                {plan.destacado && (
                  <div className="text-center mb-4">
                    <span className="inline-flex px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                      Más popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.descripcion}</p>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.precio}</span>
                    <span className="text-gray-400 text-sm ml-1">/ mes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.caracteristicas.map((c, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      {c}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <button type="button" className={`w-full py-3 rounded-xl font-bold text-sm transition ${plan.destacado ? "bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-200" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}>
                    Seleccionar
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">¿Listo para digitalizar tu negocio?</h2>
          <p className="text-blue-200 text-lg mb-8">Únete a cientos de talleres que ya usan AutoManage</p>
          <Link href="/register">
            <button type="button" className="px-10 py-4 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-400 transition shadow-lg shadow-orange-500/30">
              Comenzar gratis ahora
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <PublicFooter />

    </div>
  );
}