"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Pencil,
  LogOut,
  Loader2,
  X,
  Check,
} from "lucide-react";
import type { ProductDoc, ProductInput, ProductCategory } from "@/lib/types";

type ProductWithId = ProductDoc & { _id: string };

const EMPTY_FORM: ProductInput = {
  category: "rank",
  name: "",
  price: "",
  color: "#3ddc84",
  perks: [],
  featured: false,
  command: "",
  order: 0,
};

export function AdminPanelClient() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [perksText, setPerksText] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setError("Ürünler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPerksText("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(product: ProductWithId) {
    setEditingId(product._id);
    setForm({
      category: product.category,
      name: product.name,
      price: product.price,
      color: product.color,
      perks: product.perks,
      featured: product.featured,
      command: product.command,
      order: product.order,
    });
    setPerksText(product.perks.join("\n"));
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  async function handleSave() {
    setFormError(null);

    if (!form.name.trim() || !form.price.trim() || !form.command.trim()) {
      setFormError("İsim, fiyat ve komut alanları zorunludur.");
      return;
    }

    setSaving(true);
    const payload: ProductInput = {
      ...form,
      perks: perksText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    };

    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push("/admin");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Kaydetme başarısız.");
        return;
      }

      closeForm();
      await loadProducts();
    } catch {
      setFormError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      alert("Silme işlemi sırasında hata oluştu.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  const ranks = products.filter((p) => p.category === "rank");
  const items = products.filter((p) => p.category === "item");

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
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="font-display font-semibold text-2xl tracking-tight mb-1">
              Mağaza ürünleri
            </h2>
            <p className="text-sm text-[var(--stone-400)]">
              Ürün eklediğinizde mağaza sayfasında anında görünür.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] transition-colors"
          >
            <Plus size={16} /> Yeni ürün
          </button>
        </div>

        {error && (
          <div className="slot pixel-corners p-4 mb-6 text-sm text-[var(--redstone)]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[var(--stone-400)]" />
          </div>
        ) : (
          <div className="space-y-10">
            <ProductSection
              title="Ranklar"
              products={ranks}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
            <ProductSection
              title="Eşyalar"
              products={items}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      {formOpen && (
        <ProductFormModal
          form={form}
          setForm={setForm}
          perksText={perksText}
          setPerksText={setPerksText}
          isEditing={editingId !== null}
          saving={saving}
          error={formError}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </div>
  );
}

function ProductSection({
  title,
  products,
  onEdit,
  onDelete,
}: {
  title: string;
  products: ProductWithId[];
  onEdit: (p: ProductWithId) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <h3 className="font-display font-semibold text-lg mb-4">{title}</h3>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--stone-400)] slot pixel-corners p-5">
          Bu kategoride henüz ürün yok.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="slot pixel-corners p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 pixel-corners flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${product.color}1A`,
                    border: `2px solid ${product.color}`,
                  }}
                >
                  <span
                    className="w-3.5 h-3.5"
                    style={{ backgroundColor: product.color }}
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 rounded-sm text-[var(--stone-400)] hover:text-[var(--emerald)] hover:bg-[var(--stone-800)] transition-colors"
                    aria-label="Düzenle"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="p-1.5 rounded-sm text-[var(--stone-400)] hover:text-[var(--redstone)] hover:bg-[var(--stone-800)] transition-colors"
                    aria-label="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h4 className="font-display font-semibold text-sm mb-1">
                {product.name}
                {product.featured && (
                  <span className="ml-2 text-[10px] font-mono-slot uppercase text-[var(--gold)]">
                    öne çıkan
                  </span>
                )}
              </h4>
              <p className="font-mono-slot text-xs text-[var(--stone-400)] mb-2">
                {product.price}
              </p>
              {product.perks.length > 0 && (
                <ul className="text-xs text-[var(--stone-400)] space-y-1 mb-2">
                  {product.perks.slice(0, 3).map((perk, i) => (
                    <li key={i}>• {perk}</li>
                  ))}
                  {product.perks.length > 3 && (
                    <li>+ {product.perks.length - 3} daha</li>
                  )}
                </ul>
              )}
              <p className="font-mono-slot text-[10px] text-[var(--stone-600)] truncate border-t border-[var(--stone-700)] pt-2 mt-2">
                {product.command}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductFormModal({
  form,
  setForm,
  perksText,
  setPerksText,
  isEditing,
  saving,
  error,
  onSave,
  onClose,
}: {
  form: ProductInput;
  setForm: (f: ProductInput) => void;
  perksText: string;
  setPerksText: (s: string) => void;
  isEditing: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="slot pixel-corners w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--stone-900)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">
            {isEditing ? "Ürünü düzenle" : "Yeni ürün"}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--stone-400)] hover:text-[var(--bone-100)]"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ProductCategory })
                }
                className="input-field"
              >
                <option value="rank">Rank</option>
                <option value="item">Eşya</option>
              </select>
            </Field>
            <Field label="Sıra">
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
                className="input-field"
              />
            </Field>
          </div>

          <Field label="İsim">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Zümrüt Rank"
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fiyat (gösterim)">
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="₺89"
                className="input-field"
              />
            </Field>
            <Field label="Renk">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="input-field h-[42px] px-1.5"
              />
            </Field>
          </div>

          <Field label="Teslimat komutu (kuyruğa eklenecek)">
            <input
              type="text"
              value={form.command}
              onChange={(e) => setForm({ ...form, command: e.target.value })}
              placeholder="lp user {username} parent add zumrut"
              className="input-field font-mono-slot text-xs"
            />
          </Field>
          <p className="text-[11px] text-[var(--stone-400)] -mt-2">
            {"{username}"} yer tutucusu satın alan oyuncunun adıyla değişir.
          </p>

          <Field label="Özellikler (her satıra bir tane, sadece rank için)">
            <textarea
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              rows={4}
              placeholder={"/kit zumrut günlük\n2 ev sınırı\nRenkli sohbet adı"}
              className="input-field font-mono-slot text-xs resize-none"
            />
          </Field>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-[var(--emerald)]"
            />
            <span className="text-sm text-[var(--bone-200)]">
              &quot;En Popüler&quot; olarak işaretle
            </span>
          </label>

          {error && (
            <p className="text-sm text-[var(--redstone)] font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-sm text-sm font-medium border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--stone-400)] transition-colors"
            >
              İptal
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
