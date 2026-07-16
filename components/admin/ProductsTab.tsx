"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Check, ImageIcon, Loader2, AlertCircle, ShoppingBag } from "lucide-react";

interface Product {
  _id: string;
  category: "rank" | "item";
  categoryId?: string;
  name: string;
  priceCredits: number;
  color: string;
  perks: string[];
  featured: boolean;
  commands: string[];
  imageBase64: string | null;
  description: string;
  order: number;
}

interface Category {
  _id: string;
  name: string;
}

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm: Omit<Product, "_id"> = {
    category: "rank",
    name: "",
    priceCredits: 0,
    color: "#5EC8F2",
    perks: [],
    featured: false,
    commands: [""],
    imageBase64: null,
    description: "",
    order: 0,
  };

  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData.products ?? []);
      setCategories(cData.categories ?? []);
    } catch {
      setError("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ ...emptyForm });
    setCreating(true);
    setEditing(null);
    setError("");
  }

  function openEdit(p: Product) {
    setForm({
      category: p.category,
      categoryId: p.categoryId,
      name: p.name,
      priceCredits: p.priceCredits,
      color: p.color,
      perks: [...p.perks],
      featured: p.featured,
      commands: [...p.commands],
      imageBase64: p.imageBase64,
      description: p.description,
      order: p.order,
    });
    setEditing(p);
    setCreating(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        perks: form.perks.filter((p) => p.trim()),
        commands: form.commands.filter((c) => c.trim()),
      };
      const url = editing ? `/api/admin/products/${editing._id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi.");
      } else {
        setCreating(false);
        setEditing(null);
        load();
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch {
      setError("Silinemedi.");
    }
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-ice-300 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-frost-100">Ürünler</h1>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">
          <Plus size={15} /> Yeni Ürün
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm mb-4">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {(creating || editing) && (
        <div className="card-surface p-6 mb-6">
          <h3 className="font-semibold text-frost-200 mb-4">
            {editing ? "Ürünü Düzenle" : "Yeni Ürün"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">İsim</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Kredi Fiyatı</label>
              <input type="number" className="input-field" value={form.priceCredits} onChange={(e) => setForm({ ...form, priceCredits: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Kategori</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as "rank" | "item" })}>
                <option value="rank">Rank</option>
                <option value="item">Item</option>
              </select>
            </div>
            <div>
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Renk (hex)</label>
              <input className="input-field" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Açıklama</label>
              <input className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Komutlar (her satır bir komut)</label>
              {form.commands.map((cmd, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input-field" value={cmd} onChange={(e) => {
                    const cmds = [...form.commands];
                    cmds[i] = e.target.value;
                    setForm({ ...form, commands: cmds });
                  }} placeholder="give {username} diamond 64" />
                  {form.commands.length > 1 && (
                    <button onClick={() => setForm({ ...form, commands: form.commands.filter((_, idx) => idx !== i) })} className="btn-ghost px-2">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setForm({ ...form, commands: [...form.commands, ""] })} className="btn-ghost text-xs mt-1">
                <Plus size={12} /> Komut ekle
              </button>
            </div>
            <div className="sm:col-span-2">
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Ayrıcalıklar (virgülle ayır)</label>
              <input className="input-field" value={form.perks.join(", ")} onChange={(e) => setForm({ ...form, perks: e.target.value.split(",").map((p) => p.trim()) })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-frost-500 text-xs font-medium mb-1.5 block">Görsel</label>
              <input type="file" accept="image/*" onChange={handleImage} className="text-frost-500 text-sm" />
              {form.imageBase64 && (
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageBase64} alt="preview" className="mt-2 w-20 h-20 rounded-lg object-cover border border-ice-300/10" />
              )}
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-ice-300" />
              <label htmlFor="featured" className="text-frost-400 text-sm">En Popüler olarak işaretle</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="btn-primary text-sm py-2 px-5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary text-sm py-2 px-5">
              <X size={14} /> İptal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p._id} className="card-surface p-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-frost-200 text-sm">{p.name}</span>
                {p.featured && <span className="badge badge-ice text-[10px]">POPÜLER</span>}
              </div>
              <span className="text-frost-600 text-xs">{p.priceCredits} kredi · {p.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(p)} className="btn-ghost p-2">
                <Edit2 size={14} />
              </button>
              <button onClick={() => remove(p._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="empty-state py-16">
            <ShoppingBag size={32} className="text-frost-800 mb-3" />
            <span className="text-frost-600 text-sm">Henüz ürün yok.</span>
          </div>
        )}
      </div>
    </div>
  );
}
