export type ProductCategory = "rank" | "item";

export interface ProductDoc {
  _id?: string;
  category: ProductCategory;
  name: string;
  price: string; // Goruntu icin serbest metin, ornek: "₺89"
  color: string; // Hex renk, kart aksani icin
  perks: string[]; // Sadece rank'lar icin kullanilir, item'larda bos dizi
  featured: boolean; // "En Populer" etiketi
  command: string; // Satin alim sonrasi kuyruga eklenecek komut sablonu.
                    // {username} yer tutucusu oyuncu adiyla degistirilir.
  order: number; // Siralama icin, kucuk sayi once gosterilir
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  category: ProductCategory;
  name: string;
  price: string;
  color: string;
  perks: string[];
  featured: boolean;
  command: string;
  order: number;
}
