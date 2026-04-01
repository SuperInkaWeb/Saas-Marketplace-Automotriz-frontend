import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 px-5 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
