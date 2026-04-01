"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "../../../lib/session";
import { UserProfile } from "../shared";

function NavItem({ label, icon, href, active }: {
  label: string; icon: React.ReactNode; href: string; active?: boolean;
}) {
  return (
    <Link href={href}
      className={["flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}>
      <span className="inline-flex h-5 w-5 items-center justify-center">{icon}</span>
      <span>{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
    </Link>
  );
}

export default function ClienteSidebar({ profile, email }: { profile: UserProfile | null, email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  const navItems = [
    { href: "/cliente/dashboard", label: "Mi Perfil", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg> },
    { href: "/cliente/reservas", label: "Mis Reservas", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> },
    { href: "/cliente/compras", label: "Mis Compras", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
    { href: "/cliente/carrito", label: "Mi Carrito", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg> },
    { href: "/cliente/historial", label: "Historial", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg> },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-white border-r border-slate-100 lg:flex shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M14 16H9m10 0h-2M5 16H3"/>
            <path d="M19 16v-3a2 2 0 0 0-2-2h-3l-1-2H7L6 11H4a2 2 0 0 0-2 2v3"/>
            <circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>
          </svg>
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-slate-900">AutoManage</div>
          <div className="text-xs text-slate-400">Panel Cliente</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavItem key={item.href} label={item.label} icon={item.icon} href={item.href}
            active={pathname.startsWith(item.href)} />
        ))}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <Link href="/business">
            <button type="button" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Ir al Marketplace
            </button>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {(profile?.name?.[0] ?? email?.[0] ?? "C").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{profile?.name ?? "Cliente"}</div>
            <div className="text-xs text-slate-400 truncate">{email ?? "—"}</div>
          </div>
          <button type="button" onClick={handleLogout} title="Cerrar sesión"
            className="text-slate-400 hover:text-rose-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
