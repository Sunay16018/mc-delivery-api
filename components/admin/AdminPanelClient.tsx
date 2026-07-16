"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  HelpCircle,
  LogOut,
  CreditCard,
  History,
  Ticket,
} from "lucide-react";
import { ProductsTab } from "./ProductsTab";
import { CategoriesTab } from "./CategoriesTab";
import { UsersTab } from "./UsersTab";

type Tab = "dashboard" | "products" | "categories" | "users" | "support" | "store-history" | "credit-history";

const sidebarItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "dashboard", label: "Anasayfa", icon: <LayoutDashboard size={17} /> },
  { id: "products", label: "Ürünler", icon: <ShoppingBag size={17} /> },
  { id: "categories", label: "Kategoriler", icon: <Tag size={17} /> },
  { id: "users", label: "Kullanıcılar", icon: <Users size={17} /> },
  { id: "support", label: "Destek Sistemi", icon: <HelpCircle size={17} />, badge: 5 },
  { id: "store-history", label: "Mağaza Geçmişi", icon: <History size={17} /> },
  { id: "credit-history", label: "Kredi Geçmişi", icon: <CreditCard size={17} /> },
];

export function AdminPanelClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-[#070B12]">
      {/* Sidebar */}
      <aside className="w-64 sidebar flex flex-col shrink-0 fixed h-full">
        <div className="p-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ice-300 to-ice-500 flex items-center justify-center">
              <span className="text-ice-950 font-bold text-sm">Z</span>
            </div>
            <span className="font-display font-bold text-frost-100">Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item w-full ${activeTab === item.id ? "active" : ""}`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="badge badge-danger text-[10px] px-2">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-ice-300/[0.04]">
          <button onClick={handleLogout} className="sidebar-item w-full text-frost-600 hover:text-red-400">
            <LogOut size={17} />
            <span className="flex-1 text-left">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "support" && <SupportTab />}
        {activeTab === "store-history" && <StoreHistoryTab />}
        {activeTab === "credit-history" && <CreditHistoryTab />}
      </main>
    </div>
  );
}

// Dashboard View
function DashboardView() {
  const [stats, setStats] = useState<{ users: number; products: number } | null>(null);

  useState(() => {
    // Fetch summary stats
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([usersData, productsData]) => {
      setStats({
        users: usersData.users?.length ?? 0,
        products: productsData.products?.length ?? 0,
      });
    }).catch(() => setStats({ users: 0, products: 0 }));
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-frost-100 mb-1">
          Hoş geldiniz, Yetkili
        </h1>
        <p className="text-frost-500 text-sm">Zefircraft yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Toplam Kullanıcı" value={stats?.users ?? "—"} icon={<Users size={18} />} />
        <StatCard label="Ürün Sayısı" value={stats?.products ?? "—"} icon={<ShoppingBag size={18} />} />
        <StatCard label="Açık Ticket" value="5" icon={<Ticket size={18} />} accent />
      </div>

      {/* Widgets */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-surface p-5">
          <h3 className="font-semibold text-frost-200 text-sm mb-4 flex items-center gap-2">
            <History size={16} className="text-ice-300" />
            Mağaza Geçmişi
          </h3>
          <div className="empty-state py-12">
            <ShoppingBag size={32} className="text-frost-800 mb-3" />
            <span className="text-frost-600 text-sm font-medium">Henüz satış yok</span>
            <span className="text-frost-700 text-xs mt-1">İlk satın alma gerçekleştiğinde burada görünecek.</span>
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-semibold text-frost-200 text-sm mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-ice-300" />
            Kredi Geçmişi
          </h3>
          <div className="empty-state py-12">
            <CreditCard size={32} className="text-frost-800 mb-3" />
            <span className="text-frost-600 text-sm font-medium">Henüz işlem yok</span>
            <span className="text-frost-700 text-xs mt-1">Kredi ekleme/çıkarma işlemleri burada listelenecek.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className="card-surface p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-ice-300/10 text-ice-300" : "bg-frost-800/50 text-frost-400"}`}>
        {icon}
      </div>
      <div>
        <div className="font-display font-bold text-2xl text-frost-100">{value}</div>
        <div className="text-frost-600 text-xs">{label}</div>
      </div>
    </div>
  );
}

// Placeholder tabs
function SupportTab() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-frost-100 mb-6">Destek Sistemi</h1>
      <div className="card-surface p-5">
        <div className="empty-state py-16">
          <HelpCircle size={40} className="text-frost-800 mb-4" />
          <span className="text-frost-600 text-base font-medium">Destek sistemi yakında aktif</span>
        </div>
      </div>
    </div>
  );
}

function StoreHistoryTab() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-frost-100 mb-6">Mağaza Geçmişi</h1>
      <div className="card-surface p-5">
        <div className="empty-state py-16">
          <History size={40} className="text-frost-800 mb-4" />
          <span className="text-frost-600 text-base font-medium">Henüz satış yok</span>
          <span className="text-frost-700 text-xs mt-1">purchase_requests koleksiyonundan okunacak.</span>
        </div>
      </div>
    </div>
  );
}

function CreditHistoryTab() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-frost-100 mb-6">Kredi Geçmişi</h1>
      <div className="card-surface p-5">
        <div className="empty-state py-16">
          <CreditCard size={40} className="text-frost-800 mb-4" />
          <span className="text-frost-600 text-base font-medium">Henüz işlem yok</span>
          <span className="text-frost-700 text-xs mt-1">credit_requests koleksiyonundan okunacak.</span>
        </div>
      </div>
    </div>
  );
}
