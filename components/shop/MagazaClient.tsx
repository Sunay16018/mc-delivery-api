"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Check, Loader2, Coins, ShoppingCart, LogIn } from "lucide-react";
import Link from "next/link";

interface PublicProduct {
  id: string;
  category: "rank" | "item";
  categoryId: string | null;
  name: string;
  price: string;
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

  // Satin alma "pending" durumundayken (ve gecerli bir requestId varken)
  // durumu birkac saniyede bir sorgula.
  useEffect(() => {
    if (purchase.status !== "pending" || !purchase.requestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/shop/purchase-status?requestId=${purchase.requestId}`);
        const data = await res.json();
        if (data.status === "completed") {
          setPurchase({ status: "completed", productId: purchase.productId });
          loadSession(); // guncel krediyi cek
          clearInterval(interval);
        } else if (data.status === "failed") {
          setPurchase({ status: "failed", productId: purchase.productId, reason: data.failReason });
          clearInterval(interval);
        }
      } catch {
        // gecici aginin kopmasi durumunda sessizce devam et, bir sonraki turda tekrar dene
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
      const data = await res.json();
      if (!res.ok) {
        setPurchase({ status: "failed", productId, reason: data.error ?? "Bilinmeyen hata" });
        return;
      }
      setPurchase({ status: "pending", requestId: data.requestId, productId });
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
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--emerald)] mb-4 inline-block">
          Mağaza
        </span>
        <h1 className="font-display font-semibold text-3xl sm:text-5xl tracking-tight mb-4">
          Sunucuyu destekle, avantajları kap
        </h1>
        <p className="text-base text-[var(--bone-200)] max-w-xl leading-relaxed">
          Satın alımlar kredi ile yapılır ve karakterine otomatik olarak
          teslim edilir. Oyun içi dengeyi bozmaz.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {sessionChecked && username ? (
            <div className="slot pixel-corners px-4 py-3 flex items-center gap-2.5">
              <Coins size={16} className="text-[var(--gold)]" />
              <span className="text-sm text-[var(--bone-200)]">
                <span className="font-semibold text-[var(--bone-100)]">{username}</span>{" "}
                — bakiye:{" "}
                <span className="font-mono-slot text-[var(--gold)]">{credits ?? 0} kredi</span>
              </span>
            </div>
          ) : sessionChecked ? (
            <Link
              href="/giris"
              className="flex items-center gap-2 slot pixel-corners px-4 py-3 text-sm font-medium text-[var(--bone-200)] hover:text-[var(--emerald)] transition-colors"
            >
              <LogIn size={16} className="text-[var(--emerald)]" />
              Alışveriş yapmak için giriş yap
            </Link>
          ) : null}
        </div>
      </section>

      {/* KATEGORI FILTRESI */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3.5 py-2 rounded-sm text-xs font-mono-slot uppercase tracking-widest transition-colors ${
                activeCategory === "all"
                  ? "bg-[var(--emerald)] text-[var(--stone-950)]"
                  : "slot pixel-corners text-[var(--stone-400)] hover:text-[var(--bone-200)]"
              }`}
            >
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-sm text-xs font-mono-slot uppercase tracking-widest transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[var(--emerald)] text-[var(--stone-950)]"
                    : "slot pixel-corners text-[var(--stone-400)] hover:text-[var(--bone-200)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-[var(--stone-400)]" />
        </div>
      ) : (
        <>
          {/* RANKLAR */}
          {ranks.length > 0 && (
            <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
              <h2 className="font-display font-semibold text-2xl tracking-tight mb-8">
                Ranklar
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {ranks.map((rank) => (
                  <RankCard
                    key={rank.id}
                    product={rank}
                    loggedIn={Boolean(username)}
                    purchase={purchase}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            </section>
          )}

          {/* EŞYALAR */}
          {items.length > 0 && (
            <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 border-t border-[var(--stone-700)] pt-16">
              <h2 className="font-display font-semibold text-2xl tracking-tight mb-8">
                Eşyalar
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    product={item}
                    loggedIn={Boolean(username)}
                    purchase={purchase}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            </section>
          )}

          {ranks.length === 0 && items.length === 0 && (
            <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
              <p className="text-sm text-[var(--stone-400)] slot pixel-corners p-6 text-center">
                Bu kategoride henüz ürün yok.
              </p>
            </section>
          )}
        </>
      )}
    </>
  );
}

function PurchaseButton({
  product,
  loggedIn,
  purchase,
  onPurchase,
}: {
  product: PublicProduct;
  loggedIn: boolean;
  purchase: PurchaseState;
  onPurchase: (id: string) => void;
}) {
  const isThisProduct = purchase.status !== "idle" && purchase.productId === product.id;

  if (!loggedIn) {
    return (
      <Link
        href="/giris"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--emerald)] hover:text-[var(--emerald)] transition-colors"
      >
        <LogIn size={15} /> Giriş yap
      </Link>
    );
  }

  if (isThisProduct && purchase.status === "pending") {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold bg-[var(--stone-800)] text-[var(--stone-400)] border border-[var(--stone-700)]"
      >
        <Loader2 size={15} className="animate-spin" /> İşleniyor...
      </button>
    );
  }

  if (isThisProduct && purchase.status === "completed") {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold bg-[var(--emerald)]/20 text-[var(--emerald)] border border-[var(--emerald)]"
      >
        <Check size={15} /> Teslim edildi!
      </button>
    );
  }

  if (isThisProduct && purchase.status === "failed") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-[var(--redstone)] text-center">
          {purchase.reason ?? "Satın alma başarısız"}
        </p>
        <button
          onClick={() => onPurchase(product.id)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] transition-colors"
        >
          <ShoppingCart size={15} /> Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => onPurchase(product.id)}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] transition-colors"
    >
      <ShoppingCart size={15} /> Satın al
    </button>
  );
}

function RankCard({
  product,
  loggedIn,
  purchase,
  onPurchase,
}: {
  product: PublicProduct;
  loggedIn: boolean;
  purchase: PurchaseState;
  onPurchase: (id: string) => void;
}) {
  return (
    <div
      className={`slot pixel-corners p-7 flex flex-col ${
        product.featured ? "slot-highlight" : ""
      }`}
    >
      {product.featured && (
        <span className="font-mono-slot text-[10px] uppercase tracking-widest text-[var(--emerald)] mb-3">
          En Popüler
        </span>
      )}
      {product.imageBase64 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageBase64}
          alt={product.name}
          className="w-12 h-12 pixel-corners object-cover mb-5"
        />
      ) : (
        <div
          className="w-12 h-12 pixel-corners flex items-center justify-center mb-5"
          style={{
            backgroundColor: `${product.color}1A`,
            border: `2px solid ${product.color}`,
          }}
        >
          <span className="w-4 h-4" style={{ backgroundColor: product.color }} />
        </div>
      )}
      <h3 className="font-display font-semibold text-xl mb-1">{product.name}</h3>
      {product.description && (
        <p className="text-xs text-[var(--stone-400)] mb-3">{product.description}</p>
      )}
      <p className="font-mono-slot text-2xl font-bold mb-6 text-[var(--gold)]">
        {product.priceCredits}
        <span className="text-xs font-normal text-[var(--stone-400)] ml-1">kredi</span>
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {product.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <Check size={15} className="text-[var(--emerald)] mt-0.5 shrink-0" />
            <span className="text-sm text-[var(--bone-200)]">{perk}</span>
          </li>
        ))}
      </ul>

      <PurchaseButton
        product={product}
        loggedIn={loggedIn}
        purchase={purchase}
        onPurchase={onPurchase}
      />
    </div>
  );
}

function ItemCard({
  product,
  loggedIn,
  purchase,
  onPurchase,
}: {
  product: PublicProduct;
  loggedIn: boolean;
  purchase: PurchaseState;
  onPurchase: (id: string) => void;
}) {
  return (
    <div className="slot pixel-corners p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
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
          <span className="text-sm text-[var(--bone-100)] truncate">{product.name}</span>
        </div>
        <span className="font-mono-slot text-sm text-[var(--gold)] shrink-0">
          {product.priceCredits} kredi
        </span>
      </div>
      <PurchaseButton
        product={product}
        loggedIn={loggedIn}
        purchase={purchase}
        onPurchase={onPurchase}
      />
    </div>
  );
}
