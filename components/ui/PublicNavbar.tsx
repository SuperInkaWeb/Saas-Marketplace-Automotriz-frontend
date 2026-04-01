"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  // Ocultar Navbar en estas rutas específicas
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
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M14 16H9m10 0h-2M5 16H3" />
                  <path d="M19 16v-3a2 2 0 0 0-2-2h-3l-1-2H7L6 11H4a2 2 0 0 0-2 2v3" />
                  <circle cx="7.5" cy="16.5" r="1.5" /><circle cx="16.5" cy="16.5" r="1.5" />
                </svg>
              </div>
              <span className="font-bold text-xl text-blue-900">AutoManage</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#home" className="text-gray-700 hover:text-blue-900 transition-colors text-sm font-medium">Home</Link>
            <Link href="/#funcionalidades" className="text-gray-700 hover:text-blue-900 transition-colors text-sm font-medium">Funcionalidades</Link>
            <Link href="/business" className="text-orange-600 hover:text-orange-700 transition-colors text-sm font-bold">
              Marketplace
            </Link>
            <Link href="/#precios" className="text-gray-700 hover:text-blue-900 transition-colors text-sm font-medium">Precios</Link>
            <Link href="/#contacto" className="text-gray-700 hover:text-blue-900 transition-colors text-sm font-medium">Contacto</Link>
            <Link href="/login">
              <button type="button" className="px-5 py-2.5 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition">
                Ingresar
              </button>
            </Link>
          </nav>
          {/* Mobile */}
          <Link href="/login" className="md:hidden">
            <button type="button" className="px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-semibold">
              Ingresar
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
