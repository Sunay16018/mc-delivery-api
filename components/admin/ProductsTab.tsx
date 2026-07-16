"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Loader2, X, Check, Upload } from "lucide-react";
import type { ProductDoc, ProductInput, ProductCategory, CategoryDoc } from "@/lib/types";

type ProductWithId = Omit<ProductDoc, "_id"> & { _id: string };
type CategoryWithId = Omit<CategoryDoc, "_id"> & { _id: string };

const EMPTY_FORM: ProductInput = {
  category: "rank",
  categoryId: "",
  name: "",
  price: "",
  priceCredits: 0,
  color: "#3ddc84",
  perks: [],
  featured: false,
  command: "",
  commands: [],
  imageBase64: null,
  description: "",
  order: 0,
};

// Base64'e cevirmeden once gorseli bu maksimum genislige/yuksekliğe
// kucultup sikistiriyoruz; boylece hem MongoDB dokuman limitine hem de
// makul sayfa yukleme surelerine uyuyoruz.
const MAX_IMAGE_DIMENSION = 512;
const IMAGE_JPEG_QUALITY = 0.85;

async function fileToCompressedBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Görsel yüklenemedi."));
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl; // fallback: sikistirmadan orijinali kullan
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", IMAGE_JPEG_QUALITY);
}

export function ProductsTab() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [categories, setCategories] = useState<CategoryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [perksText, setPerksText] = useState("");
  const [commandsText, setCommandsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      if (productsRes.status === 401 || categoriesRes.status === 401) {
        router.push("/admin");
        return;
      }
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
    } catch {
      setError("Ürünler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPerksText("");
    setCommandsText("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(product: ProductWithId) {
    setEditingId(product._id);
    setForm({
      category: product.category,
      categoryId: product.categoryId ?? "",
      name: product.name,
      price: product.price,
      priceCredits: product.priceCredits ?? 0,
      color: product.color,
      perks: product.perks,
      featured: product.featured,
      command: product.command,
      commands: product.commands ?? (product.command ? [product.command] : []),
      imageBase64: product.imageBase64 ?? null,
      description: product.description ?? "",
      order: product.order,
    });
    setPerksText(product.perks.join("\n"));
    setCommandsText((product.commands ?? (product.command ? [product.command] : [])).join("\n"));
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  async function handleImageSelected(file: File) {
    setImageUploading(true);
    try {
      const compressed = await fileToCompressedBase64(file);
      setForm((prev) => ({ ...prev, imageBase64: compressed }));
    } catch {
      setFormError("Görsel işlenemedi, lütfen başka bir dosya deneyin.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSave() {
    setFormError(null);

    const commands = commandsText
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    if (!form.name.trim()) {
      setFormError("İsim alanı zorunludur.");
      return;
    }
    if (commands.length === 0) {
      setFormError("En az bir teslimat komutu girmelisiniz.");
      return;
    }
    if (form.priceCredits < 0) {
      setFormError("Fiyat 0 veya daha büyük olmalıdır.");
      return;
    }

    setSaving(true);
    const payload: ProductInput = {
      ...form,
      commands,
      command: commands[0],
      categoryId: form.categoryId || undefined,
      perks: perksText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    };

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
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
      await loadAll();
    } catch {
      setFormError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
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

  const ranks = products.filter((p) => p.category === "rank");
  const items = products.filter((p) => p.category === "item");

  return (
    <div>
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
          <ProductSection title="Ranklar" products={ranks} onEdit={openEditForm} onDelete={handleDelete} />
          <ProductSection title="Eşyalar" products={items} onEdit={openEditForm} onDelete={handleDelete} />
        </div>
      )}

      {formOpen && (
        <ProductFormModal
          form={form}
          setForm={setForm}
          perksText={perksText}
          setPerksText={setPerksText}
          commandsText={commandsText}
          setCommandsText={setCommandsText}
          categories={categories}
          isEditing={editingId !== null}
          saving={saving}
          imageUploading={imageUploading}
          error={formError}
          onImageSelected={handleImageSelected}
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
                {product.imageBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageBase64}
                    alt={product.name}
                    className="w-9 h-9 pixel-corners object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 pixel-corners flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${product.color}1A`,
                      border: `2px solid ${product.color}`,
                    }}
                  >
                    <span className="w-3.5 h-3.5" style={{ backgroundColor: product.color }} />
                  </div>
                )}
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
              <p className="font-mono-slot text-xs text-[var(--gold)] mb-2">
                {product.priceCredits ?? 0} kredi
              </p>
              {product.perks.length > 0 && (
                <ul className="text-xs text-[var(--stone-400)] space-y-1 mb-2">
                  {product.perks.slice(0, 3).map((perk, i) => (
                    <li key={i}>• {perk}</li>
                  ))}
                  {product.perks.length > 3 && <li>+ {product.perks.length - 3} daha</li>}
                </ul>
              )}
              <p className="font-mono-slot text-[10px] text-[var(--stone-600)] truncate border-t border-[var(--stone-700)] pt-2 mt-2">
                {(product.commands ?? [product.command]).join(" • ")}
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
  commandsText,
  setCommandsText,
  categories,
  isEditing,
  saving,
  imageUploading,
  error,
  onImageSelected,
  onSave,
  onClose,
}: {
  form: ProductInput;
  setForm: (f: ProductInput) => void;
  perksText: string;
  setPerksText: (s: string) => void;
  commandsText: string;
  setCommandsText: (s: string) => void;
  categories: CategoryWithId[];
  isEditing: boolean;
  saving: boolean;
  imageUploading: boolean;
  error: string | null;
  onImageSelected: (file: File) => void;
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
          <button onClick={onClose} className="text-[var(--stone-400)] hover:text-[var(--bone-100)]" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Ürün görseli">
            <div className="flex items-center gap-3">
              {form.imageBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageBase64} alt="Önizleme" className="w-14 h-14 pixel-corners object-cover" />
              ) : (
                <div className="w-14 h-14 pixel-corners bg-[var(--stone-800)] border border-[var(--stone-700)] flex items-center justify-center text-[var(--stone-400)]">
                  <Upload size={18} />
                </div>
              )}
              <label className="cursor-pointer px-3.5 py-2 rounded-sm text-xs font-semibold border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--emerald)] transition-colors">
                {imageUploading ? "Yükleniyor..." : "Görsel seç"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={imageUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageSelected(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {form.imageBase64 && (
                <button
                  onClick={() => setForm({ ...form, imageBase64: null })}
                  className="text-xs text-[var(--redstone)] hover:underline"
                >
                  Kaldır
                </button>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori (rank/eşya)">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
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
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="input-field"
              />
            </Field>
          </div>

          <Field label="Mağaza kategorisi (filtreleme için)">
            <select
              value={form.categoryId ?? ""}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input-field"
            >
              <option value="">Kategori seçilmedi</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="İsim">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Zümrüt Rank"
              className="input-field"
            />
          </Field>

          <Field label="Açıklama (mağazada gösterilir)">
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Sunucuda ayrıcalıklı bir deneyim"
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fiyat (kredi)">
              <input
                type="number"
                min={0}
                value={form.priceCredits}
                onChange={(e) => setForm({ ...form, priceCredits: Number(e.target.value) })}
                placeholder="500"
                className="input-field font-mono-slot"
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

          <Field label="Teslimat komutları (her satıra bir tane)">
            <textarea
              value={commandsText}
              onChange={(e) => setCommandsText(e.target.value)}
              rows={3}
              placeholder={"lp user {username} parent add zumrut\nbroadcast {username} zumrut rank aldi!"}
              className="input-field font-mono-slot text-xs resize-none"
            />
          </Field>
          <p className="text-[11px] text-[var(--stone-400)] -mt-2">
            {"{username}"} yer tutucusu satın alan oyuncunun adıyla değişir. Her satır ayrı bir
            komut olarak sırayla çalıştırılır.
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
            <span className="text-sm text-[var(--bone-200)]">&quot;En Popüler&quot; olarak işaretle</span>
          </label>

          {error && <p className="text-sm text-[var(--redstone)] font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-sm text-sm font-medium border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--stone-400)] transition-colors"
            >
              İptal
            </button>
            <button
              onClick={onSave}
              disabled={saving || imageUploading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
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
