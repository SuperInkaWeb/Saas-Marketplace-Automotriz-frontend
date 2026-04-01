"use client";

import { usePathname } from "next/navigation";

export default function PublicFooter() {
  const pathname = usePathname();

  // No mostrar el footer en las siguientes rutas:
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/business" ||
    pathname.startsWith("/business/") ||
    pathname === "/marketplace"
  ) {
    return null;
  }

  return (
    <footer id="contacto" className="bg-blue-900 text-white py-12 border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M14 16H9m10 0h-2M5 16H3"/>
                  <path d="M19 16v-3a2 2 0 0 0-2-2h-3l-1-2H7L6 11H4a2 2 0 0 0-2 2v3"/>
                  <circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>
                </svg>
              </div>
              <span className="font-bold text-xl">AutoManage</span>
            </div>
            <p className="text-blue-200 text-sm">La mejor solución para gestionar tu negocio automotriz</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>Email: info@automanage.com</li>
              <li>Teléfono: +51 999 123 456</li>
              <li>Dirección: Lima, Perú</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Redes Sociales</h3>
            <div className="flex gap-3">
              {["f", "t", "ig", "in"].map((s, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition text-xs font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-blue-800 pt-8 text-center text-blue-300 text-sm">
          © {new Date().getFullYear()} AutoManage. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
