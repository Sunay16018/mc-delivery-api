import { ObjectId } from "mongodb";

export type ProductCategory = "rank" | "item";

export interface ProductDoc {
  _id?: ObjectId;
  category: ProductCategory;
  categoryId?: string; // "categories" koleksiyonuna referans (opsiyonel; eski
                        // kayitlarda olmayabilir, bu durumda sadece "category"
                        // (rank/item) kullanilir).
  name: string;
  price: string; // Goruntu icin serbest metin, ornek: "₺89" (ESKI ALAN,
                 // geriye donuk uyumluluk icin tutuluyor)
  priceCredits: number; // YENI: magazadaki gercek fiyat, KREDI cinsinden.
                         // Satin alma kuyrugu bu alani kullanir.
  color: string; // Hex renk, kart aksani icin
  perks: string[]; // Sadece rank'lar icin kullanilir, item'larda bos dizi
  featured: boolean; // "En Populer" etiketi
  command: string; // ESKI ALAN: tekil komut sablonu, geriye donuk uyumluluk
                    // icin tutuluyor. Yeni kayitlarda "commands" kullanilir.
  commands: string[]; // YENI: satin alim sonrasi kuyruga eklenecek komut
                       // sablonlari listesi. {username} yer tutucusu oyuncu
                       // adiyla degistirilir.
  imageBase64: string | null; // Admin panelden yuklenen urun gorseli,
                               // "data:image/png;base64,...." formatinda.
  description: string; // Magaza vitrininde gosterilecek kisa aciklama.
  order: number; // Siralama icin, kucuk sayi once gosterilir
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  category: ProductCategory;
  categoryId?: string;
  name: string;
  price: string;
  priceCredits: number;
  color: string;
  perks: string[];
  featured: boolean;
  command: string;
  commands: string[];
  imageBase64: string | null;
  description: string;
  order: number;
}

export interface CategoryDoc {
  _id?: ObjectId;
  name: string;
  order: number;
  createdAt: string;
}

export interface CategoryInput {
  name: string;
  order: number;
}

/**
 * users koleksiyonu - plugin tarafiyla PAYLASILAN sema.
 * Kayit sadece oyun icinden (plugin) yapilir; web sitesi bu koleksiyona
 * asla yeni kayit eklemez, sadece OKUR (giris dogrulama) veya kredi
 * degisikligi icin "credit_requests" kuyrugu uzerinden istek dusurur.
 */
export interface UserDoc {
  _id?: ObjectId;
  username: string; // Minecraft'taki orijinal (case-sensitive gorunum) hali
  username_lower: string; // kucuk harfli, arama icin
  password: string; // bcrypt hash (plugin tarafinda jBCrypt ile uretilir)
  credits: number;
  registerDate: string | Date;
  ipAddress: string;
}

/**
 * purchase_requests koleksiyonu - magaza satin alimlarinin kuyruk kaydi.
 * Web sitesi SADECE "pending" durumunda kayit ekler; kredi dusme ve komut
 * calistirma islemini plugin tarafindaki PurchaseProcessor yapar.
 */
export interface PurchaseRequestDoc {
  _id?: ObjectId;
  username: string;
  productId: string;
  status: "pending" | "completed" | "failed";
  createdAt: string | Date;
  processedAt: string | Date | null;
  failReason: string | null;
}

/**
 * credit_requests koleksiyonu - admin panelden manuel kredi
 * ekleme/cikarma/setleme istekleri icin kuyruk kaydi. Ayni sekilde,
 * gercek kredi guncellemesini plugin yapar.
 */
export interface CreditRequestDoc {
  _id?: ObjectId;
  username: string;
  action: "add" | "subtract" | "set";
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string | Date;
  processedAt: string | Date | null;
}
