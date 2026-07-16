"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Package, Tags, Users } from "lucide-react";
import { ProductsTab } from "./ProductsTab";
import { CategoriesTab } from "./CategoriesTab";
import { UsersTab } from "./UsersTab";

type Tab = "products" | "categories" | "users";

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "products", label: "Ürünler", icon: Package },
  { id: "categories", label: "Kategoriler", icon: Tags },
  { id: "users", label: "Kullanıcılar", icon: Users },
];

export function AdminPanelClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--stone-950)]">
      <header className="sticky top-0 z-40 border-b border-[var(--stone-700)] bg-[var(--stone-950)]/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <h1 className="font-display font-semibold text-lg tracking-tight">
            Zefircraft <span className="text-[var(--emerald)]">Admin</span>
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-[var(--stone-400)] hover:text-[var(--redstone)] transition-colors"
          >
            <LogOut size={16} /> Çıkış yap
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex gap-1 pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-[var(--emerald)]/15 text-[var(--emerald)]"
                  : "text-[var(--stone-400)] hover:text-[var(--bone-200)] hover:bg-[var(--stone-800)]"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        {tab === "products" && <ProductsTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "users" && <UsersTab />}
      </main>
    </div>
  );
}
