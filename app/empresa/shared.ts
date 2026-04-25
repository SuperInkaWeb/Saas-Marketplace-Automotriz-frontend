export type Tab = "dashboard" | "citas" | "servicios" | "clientes" | "inventario" | "reportes";

export type Business = {
  id: number;
  name?: string | null;
  category?: string | null;
  address?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
};

export type Booking = {
  id: number;
  serviceName?: string | null;
  businessName?: string | null;
  clientName?: string | null;
  date?: string | null;
  time?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type Service = {
  id: number;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  duration?: number | null;
  active?: boolean | null;
};

export type Product = {
  id: number;
  name?: string | null;
  category?: string | null;
  brand?: string | null;
  price?: number | null;
  stock?: number | null;
  supplier?: string | null;
  photoUrl?: string | null;
  igv?: boolean | null;
};

export type ClientSummary = {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  totalReservas?: number | null;
  ultimaVisita?: string | null;
};

export type DashboardData = {
  reservasHoy: number;
  reservasPendientes: number;
  reservasCompletadas: number;
  ingresosTotal: number;
  clientesTotal: number;
  servicioMasSolicitado: string;
};

export type Report = {
  totalReservas: number;
  reservasCompletadas: number;
  reservasCanceladas: number;
  ingresosPeriodo: number;
  serviciosMasSolicitados: { nombre: string; total: number }[];
  clientesFrecuentes: { clientId: number; nombre: string; totalReservas: number }[];
};

export type Order = {
  id: number;
  clientId: number;
  clientName: string;
  businessId: number;
  businessName: string;
  totalAmount: number;
  status: string;
  address: string;
  phone: string;
  notes: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
};

export function statusColor(status: string | null | undefined) {
  switch (status?.toUpperCase()) {
    case "CONFIRMED": return "bg-emerald-100 text-emerald-700";
    case "PENDING":   return "bg-amber-100 text-amber-700";
    case "CANCELLED": return "bg-rose-100 text-rose-700";
    case "COMPLETED": return "bg-slate-100 text-slate-600";
    default:          return "bg-slate-100 text-slate-500";
  }
}

export function statusLabel(status: string | null | undefined) {
  switch (status?.toUpperCase()) {
    case "CONFIRMED": return "Confirmada";
    case "PENDING":   return "Pendiente";
    case "CANCELLED": return "Cancelada";
    case "COMPLETED": return "Completada";
    default:          return status ?? "-";
  }
}
