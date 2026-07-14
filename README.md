# Zefircraft

Zefircraft Minecraft sunucusu için Next.js 14 (App Router) ile hazırlanmış
tanıtım sitesi. Anlık sunucu durumu, mağaza vitrini, oyuncu sıralaması,
kurallar ve hakkında sayfalarını içerir.

## Sayfalar

- `/` — Ana sayfa, canlı sunucu durumu widget'ı
- `/magaza` — Rank ve eşya vitrini (ödeme henüz bağlı değil)
- `/siralama` — Oyuncu sıralaması (şu an örnek veri)
- `/kurallar` — Sunucu kuralları
- `/hakkinda` — Sunucu hakkında bilgi

## Sunucu durumu

`/api/server-status` route'u `api.mcsrvstat.us` üzerinden
`zefircraft.mcsh.io` adresini sorgular (önce Java, olmazsa Bedrock).
Adres değişirse `app/api/server-status/route.ts` içindeki
`SERVER_ADDRESS` sabitini güncelleyin.

## Mağaza teslimat altyapısı

`app/api/queue` ve `app/api/queue/complete` route'ları, önceki
`mc-delivery-api` projesinden taşınmıştır. Bir ödeme sağlayıcısı
bağlandığında, başarılı ödeme sonrası bu koleksiyona `status: "pending"`
bir komut dokümanı eklemeniz yeterli — sunucudaki plugin bunu
`/api/queue` ile çekip işleyecektir.

Gerekli ortam değişkenleri (`.env.example` dosyasına bakın):

- `MONGODB_URI`
- `MONGODB_DB`
- `SECRET_KEY` — plugin ile bu API arasındaki `Authorization: Bearer`
  anahtarı

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
