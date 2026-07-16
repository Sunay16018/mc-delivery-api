"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Check, Loader2, AlertCircle, Tag } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  order: number;
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
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
    setName("");
    setOrder(categories.length);
    setCreating(true);
    setEditing(null);
    setError("");
  }

  function openEdit(c: Category) {
    setName(c.name);
    setOrder(c.order);
    setEditing(c);
    setCreating(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/admin/categories/${editing._id}` : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, order }),
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
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch {
      setError("Silinemedi.");
    }
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
        <h1 className="font-display font-bold text-2xl text-frost-100">Kategoriler</h1>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">
          <Plus size={15} /> Yeni Kategori
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/15 text-red-400 text-sm mb-4">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {(creating || editing) && (
        <div className="card-surface p-5 mb-6">
          <h3 className="font-semibold text-frost-200 mb-4">{editing ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h3>
          <div className="flex gap-3">
            <input
              className="input-field flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kategori adı"
            />
            <input
              type="number"
              className="input-field w-24"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              placeholder="Sıra"
            />
            <button onClick={save} disabled={saving} className="btn-primary text-sm py-2 px-4">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary text-sm py-2 px-3">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c._id} className="card-surface p-4 flex items-center gap-4">
            <Tag size={16} className="text-ice-300" />
            <div className="flex-1">
              <span className="font-semibold text-frost-200 text-sm">{c.name}</span>
              <span className="text-frost-600 text-xs ml-2">Sıra: {c.order}</span>
            </div>
            <button onClick={() => openEdit(c)} className="btn-ghost p-2">
              <Edit2 size={14} />
            </button>
            <button onClick={() => remove(c._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="empty-state py-16">
            <Tag size={32} className="text-frost-800 mb-3" />
            <span className="text-frost-600 text-sm">Henüz kategori yok.</span>
          </div>
        )}
      </div>
    </div>
  );
}
