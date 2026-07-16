# Zefircraft

Zefircraft Minecraft sunucusu için Next.js 14 (App Router) ile hazırlanmış
tanıtım sitesi. Anlık sunucu durumu, mağaza vitrini, oyuncu sıralaması,
kurallar ve hakkında sayfalarını içerir.

## Sayfalar

- `/` — Ana sayfa, canlı sunucu durumu widget'ı
- `/magaza` — Rank ve eşya vitrini, gerçek MongoDB verisiyle, kategori
  filtresi ve kredi ile satın alma akışı dahil
- `/giris` — Oyuncu girişi (kayıt burada değil, sadece oyun içinden)
- `/siralama` — Oyuncu sıralaması (şu an örnek veri)
- `/kurallar` — Sunucu kuralları
- `/hakkinda` — Sunucu hakkında bilgi
- `/admin` → `/admin/panel` — Ürün/kategori/kullanıcı yönetim paneli

## Sunucu durumu

`/api/server-status` route'u `api.mcsrvstat.us` üzerinden
`zefircraft.mcsh.io` adresini sorgular (önce Java, olmazsa Bedrock).
Adres değişirse `app/api/server-status/route.ts` içindeki
`SERVER_ADDRESS` sabitini güncelleyin.

## Mağaza teslimat altyapısı

`app/api/queue` ve `app/api/queue/complete` route'ları, önceki
`mc-delivery-api` projesinden taşınmıştır ve McDelivery plugin'i
tarafından kullanılır.

## Login / kayıt / kredi sistemi

Site, kendi login/kayıt/kredi sistemini Minecraft sunucusundaki
McDelivery plugin'iyle **aynı** MongoDB veritabanı üzerinden paylaşır.

- **Kayıt sadece oyun içinden yapılır** (`/kayitol`), site üzerinde
  kayıt formu yoktur.
- `/giris` sayfası, `users` koleksiyonundaki bcrypt hash'ini
  `bcryptjs` ile doğrulayarak giriş yapar ve `zc_user_session`
  cookie'sinde ayrı bir oturum açar (admin oturumundan tamamen
  bağımsız).
- Mağazadan yapılan satın alımlar krediyi **doğrudan güncellemez**;
  `purchase_requests` koleksiyonuna `pending` bir kayıt düşer, gerçek
  kredi düşme/komut teslimatı sunucudaki plugin tarafından yapılır.
- Admin panelindeki manuel kredi ekleme/çıkarma/setleme işlemleri de
  aynı şekilde `credit_requests` koleksiyonu üzerinden kuyruğa
  alınır.
- Bu mimari, sitenin ele geçirilmesi durumunda DB'ye doğrudan
  yazılarak kredi manipülasyonu yapılmasını zorlaştırmak için
  bilinçli olarak seçilmiştir (MongoDB bağlantı bilgisinin kendisi
  ele geçirilirse bu koruma da aşılabilir).

Gerekli ortam değişkenleri (`.env.example` dosyasına bakın):

- `MONGODB_URI` / `MONGODB_DB` — McDelivery plugin'inin `config.yml`
  dosyasındaki `mongo.uri` / `mongo.database` ile **aynı** veritabanını
  göstermelidir
- `SECRET_KEY` — hem `/api/queue*` endpoint'lerinin Bearer auth'u hem
  admin/kullanıcı oturum cookie'lerinin imzalanması için kullanılır

## Admin paneli

`/admin` üzerinden `SECRET_KEY` ile giriş yapılır. Panelde üç sekme
bulunur:

- **Ürünler** — rank/eşya CRUD'u, görsel yükleme (dosya seçilip
  otomatik olarak küçültülüp base64 olarak kaydedilir), kredi
  cinsinden fiyat, teslimat komutları listesi
- **Kategoriler** — mağaza filtre butonlarını besleyen basit CRUD
- **Kullanıcılar** — kayıtlı oyuncu listesi, arama, manuel kredi
  işlemi başlatma (kuyruk üzerinden)

## Sıralama verisi

`app/siralama/page.tsx` içindeki `PLAYERS` dizisi şu an örnek veridir.
Gerçek plugin API'niz hazır olduğunda, bu diziyi kaldırıp sayfayı bir
`async` server component'e çevirerek kendi kaynağınızdan `fetch` edin.

## Geliştirme

```bash
npm install
npm run dev
```

## Vercel'e deploy

Repo'yu Vercel'e bağlayın, `Environment Variables` kısmına yukarıdaki üç
değişkeni ekleyin, deploy edin. `vercel.json` dosyası framework'ü
`nextjs` olarak zaten belirtiyor.
