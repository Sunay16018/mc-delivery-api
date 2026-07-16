"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Loader2, X, Check } from "lucide-react";
import type { CategoryDoc, CategoryInput } from "@/lib/types";

type CategoryWithId = Omit<CategoryDoc, "_id"> & { _id: string };

const EMPTY_FORM: CategoryInput = { name: "", order: 0 };

export function CategoriesTab() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setError("Kategoriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(category: CategoryWithId) {
    setEditingId(category._id);
    setForm({ name: category.name, order: category.order });
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  async function handleSave() {
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("İsim alanı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      await loadCategories();
    } catch {
      setFormError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki ürünler kategorisiz kalır.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch {
      alert("Silme işlemi sırasında hata oluştu.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-semibold text-2xl tracking-tight mb-1">
            Mağaza kategorileri
          </h2>
          <p className="text-sm text-[var(--stone-400)]">
            Kategoriler mağaza sayfasındaki filtre butonlarında görünür.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] transition-colors"
        >
          <Plus size={16} /> Yeni kategori
        </button>
      </div>

      {error && (
        <div className="slot pixel-corners p-4 mb-6 text-sm text-[var(--redstone)]">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--stone-400)]" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-[var(--stone-400)] slot pixel-corners p-5">
          Henüz kategori yok.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="slot pixel-corners p-5 flex items-center justify-between">
              <div>
                <h4 className="font-display font-semibold text-sm">{cat.name}</h4>
                <p className="text-xs text-[var(--stone-400)] font-mono-slot">sıra: {cat.order}</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEditForm(cat)}
                  className="p-1.5 rounded-sm text-[var(--stone-400)] hover:text-[var(--emerald)] hover:bg-[var(--stone-800)] transition-colors"
                  aria-label="Düzenle"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 rounded-sm text-[var(--stone-400)] hover:text-[var(--redstone)] hover:bg-[var(--stone-800)] transition-colors"
                  aria-label="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="slot pixel-corners w-full max-w-sm bg-[var(--stone-900)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">
                {editingId ? "Kategoriyi düzenle" : "Yeni kategori"}
              </h3>
              <button onClick={closeForm} className="text-[var(--stone-400)] hover:text-[var(--bone-100)]" aria-label="Kapat">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-1.5">
                  İsim
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ranklar"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-1.5">
                  Sıra
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="input-field"
                />
              </div>

              {formError && <p className="text-sm text-[var(--redstone)] font-medium">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-sm text-sm font-medium border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--stone-400)] transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
