"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Check, Loader2, Coins, ShoppingCart, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Slot } from "@/components/Slot";
import { Footer } from "@/components/Footer";


interface PublicProduct {
  id: string;
  category: "rank" | "item";
  categoryId: string | null;
  name: string;
  priceCredits: number;
  color: string;
  perks: string[];
  featured: boolean;
  imageBase64: string | null;
  description: string;
}

interface PublicCategory {
  id: string;
  name: string;
}

type PurchaseState =
  | { status: "idle" }
  | { status: "pending"; requestId: string; productId: string }
  | { status: "completed"; productId: string }
  | { status: "failed"; productId: string; reason: string | null };

export function MagazaClient() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const [username, setUsername] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [purchase, setPurchase] = useState<PurchaseState>({ status: "idle" });

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setUsername(data.loggedIn ? data.username : null);
      setCredits(data.loggedIn ? data.credits : null);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
    loadCatalog();
  }, [loadSession, loadCatalog]);

  // Poll purchase status
  useEffect(() => {
    if (purchase.status !== "pending" || !purchase.requestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/shop/purchase-status?requestId=${purchase.requestId}`);
        const data = await res.json();
        if (data.status === "completed") {
          setPurchase({ status: "completed", productId: purchase.productId });
          loadSession();
          clearInterval(interval);
        } else if (data.status === "failed") {
          setPurchase({ status: "failed", productId: purchase.productId, reason: data.failReason });
          clearInterval(interval);
        }
      } catch {
        // silent retry
      }
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchase]);

  async function handlePurchase(productId: string) {
    setPurchase({ status: "pending", requestId: "", productId });
    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      interface PurchaseSuccessResponse {
        requestId: string;
      }
      interface PurchaseErrorResponse {
        error: string;
      }
      type PurchaseResponse = PurchaseSuccessResponse | PurchaseErrorResponse;

      const data: PurchaseResponse = await res.json();
      if (!res.ok) {
        setPurchase({ status: "failed", productId, reason: (data as PurchaseErrorResponse).error ?? "Bilinmeyen hata" });
        return;
      }
      setPurchase({ status: "pending", requestId: (data as PurchaseSuccessResponse).requestId, productId });
    } catch {
      setPurchase({ status: "failed", productId, reason: "Bağlantı hatası" });
    }
  }

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.categoryId === activeCategory);
  }, [products, activeCategory]);

  const ranks = filteredProducts.filter((p) => p.category === "rank");
  const items = filteredProducts.filter((p) => p.category === "item");

  return (
    <>
      <Nav />

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        {/* Header */}
        <div className="mb-10">
          <span className="section-label mb-3 inline-block">Mağaza</span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3 text-frost-100">
            Sunucuyu destekle, avantajları kap
          </h1>
          <p className="text-frost-500 text-base max-w-xl leading-relaxed">
            Satın alımlar kredi ile yapılır ve karakterine otomatik olarak teslim edilir.
          </p>
        </div>

        {/* User bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {sessionChecked && username ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-ice-300/[0.05] border border-ice-300/10">
              <Coins size={16} className="text-ice-300" />
              <span className="text-frost-200 text-sm font-semibold">{username}</span>
              <span className="w-px h-4 bg-ice-300/10" />
              <span className="text-ice-300 text-sm font-mono font-bold">{credits} kredi</span>
            </div>
          ) : (
            <Link
              href="/giris"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ice-300/[0.05] border border-ice-300/10 text-frost-400 text-sm font-medium hover:text-ice-300 hover:border-ice-300/20 transition-all"
            >
              <LogIn size={15} />
              Satın almak için giriş yap
            </Link>
          )}

          {purchase.status === "completed" && (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <Check size={15} />
              Satın alma tamamlandı!
            </span>
          )}
          {purchase.status === "pending" && (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ice-300/[0.05] border border-ice-300/10 text-ice-300 text-sm font-medium">
              <Loader2 size={15} className="animate-spin" />
              İşleniyor...
            </span>
          )}
          {purchase.status === "failed" && (
            <FailedPurchaseMessage purchase={purchase} />
          )}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-ice-300/10 text-ice-100 border border-ice-300/20"
                  : "bg-frost-900/50 text-frost-500 border border-transparent hover:bg-ice-300/[0.05] hover:text-frost-300"
              }`}
            >
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-ice-300/10 text-ice-100 border border-ice-300/20"
                    : "bg-frost-900/50 text-frost-500 border border-transparent hover:bg-ice-300/[0.05] hover:text-frost-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-surface p-5 animate-pulse">
                <div className="h-5 bg-ice-300/10 rounded w-2/3 mb-4" />
                <div className="h-3 bg-ice-300/10 rounded w-full mb-2" />
                <div className="h-3 bg-ice-300/10 rounded w-3/4 mb-6" />
                <div className="h-8 bg-ice-300/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Ranks */}
        {!loading && ranks.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display font-bold text-xl text-frost-200 mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-ice-300" />
              Ranklar
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ranks.map((p) => (
                <Slot
                  key={p.id}
                  name={p.name}
                  priceCredits={p.priceCredits}
                  color={p.color}
                  perks={p.perks}
                  featured={p.featured}
                  imageBase64={p.imageBase64}
                  description={p.description}
                  onPurchase={() => handlePurchase(p.id)}
                  disabled={purchase.status === "pending" || !username}
                />
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        {!loading && items.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-frost-200 mb-5 flex items-center gap-2">
              <ShoppingCart size={18} className="text-ice-300" />
              Itemlar
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((p) => (
                <Slot
                  key={p.id}
                  name={p.name}
                  priceCredits={p.priceCredits}
                  color={p.color}
                  perks={p.perks}
                  featured={p.featured}
                  imageBase64={p.imageBase64}
                  description={p.description}
                  onPurchase={() => handlePurchase(p.id)}
                  disabled={purchase.status === "pending" || !username}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="empty-state py-20">
            <ShoppingCart size={40} className="text-frost-700 mb-4" />
            <span className="text-frost-500 text-base font-medium">Henüz ürün yok</span>
            <span className="text-frost-600 text-sm mt-1">Yakında eklenecek!</span>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

function FailedPurchaseMessage({ purchase }: { purchase: { status: "failed"; productId: string; reason: string | null } }) {
  return (
    <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
      {purchase.reason ?? "Satın alma başarısız"}
    </span>
  );
}
