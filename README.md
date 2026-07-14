# MCDelivery API - Vercel + Next.js + MongoDB

Tebex/LeaderOS tarzi kuyruk tabanli komut teslimat sistemi icin Next.js (App Router) API.

## Kurulum

### 1. Ön Koşullar
- MongoDB Atlas (M0 Free Tier) hesabı ve connection string
- Vercel hesabı (GitHub ile giriş)
- GitHub repo (fork veya yeni repo)

### 2. MongoDB Atlas Kurulumu

1. [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) açın
2. **M0 Free Cluster** oluşturun (region: Frankfurt/eu-west)
3. Database adı: **mc_delivery**
4. **Database Access** → yeni user oluşturun (güçlü şifre kaydedin)
5. **Network Access** → `0.0.0.0/0` ekleyin
6. **Connect** → "Drivers" → Node.js seçin
7. Connection string'i kopyalayın (formatı: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### 3. Bu Kodu GitHub'a Push Edin

```bash
git clone <bu-repo>
cd mc-delivery-api
git add .
git commit -m "Initial commit"
git push origin main
```

### 4. Vercel'de Deploy Edin

1. [vercel.com](https://vercel.com) açın, GitHub ile giriş yapın
2. "Add New" → "Project" → repository'nizi seçin
3. "Import" tıklayın
4. **Environment Variables** bölümüne ekleyin:
   - `MONGODB_URI` → MongoDB Atlas connection string
   - `MONGODB_DB` → `mc_delivery`
   - `SECRET_KEY` → güçlü rastgele bir string (örn. 32 karakter)
5. "Deploy" tıklayın

Deployment tamamlandıktan sonra vercel.app'da canlı olacak.

### 5. Plugin'de Ayarları Yapın

Plugin `config.yml` dosyasını açıp:
```yaml
vercel-api-url: "https://projeniz.vercel.app"  # Vercel deploy URL'i
secret-key: "aynı-key-buraya"                   # Vercel'de girdiğiniz SECRET_KEY
```

`/mcdelivery reload` çalıştırarak aktif hale getirin.

## API Endpoints

### GET /api/queue
Bekleyen (`pending`) komutları çeker.

**Headers:**
```
Authorization: Bearer <SECRET_KEY>
```

**Response:**
```json
{
  "commands": [
    {
      "id": "507f1f77bcf86cd799439011",
      "username": "Steve",
      "command": "give %player% diamond 10"
    }
  ]
}
```

### POST /api/queue/complete
Çalıştırılan komutların sonuçlarını bildirir.

**Headers:**
```
Authorization: Bearer <SECRET_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "completed": ["507f1f77bcf86cd799439011"],
  "failed": ["507f1f77bcf86cd799439012"]
}
```

## MongoDB Şeması

Collection: `commands`

```typescript
{
  _id: ObjectId,
  username: string,              // Oyuncu adı
  command: string,               // Komut şablonu (ör: "give %player% diamond 10")
  status: "pending" | "processing" | "completed" | "failed",
  createdAt: Date,               // Oluşturulma zamanı
  processedAt?: Date             // İşlenme zamanı (opsiyonel)
}
```

## Durum Akışı

```
pending → (GET /api/queue) → processing → (komut çalıştırılıyor) → 
  ├→ completed (başarılı) → (POST /api/queue/complete) → completed
  └→ failed (başarısız) → (POST /api/queue/complete) → failed
```

## Güvenlik

- Tüm API endpoints Bearer token ile korunmuştur
- Token'lar env variable'dan okunur (koda gömülü değil)
- Timing-safe string comparison (timing attack koruması)
- CORS: sadece kendi Vercel domaininizden tarayıcı istekleri (plugin HTTP istekleri header ile korunur)

## Hata Çözme

### "401 Unauthorized"
- SECRET_KEY plugin config'deki değerle eşleşmiyor
- Vercel env variables'a tekrar girin, /mcdelivery reload çalıştırın

### "MONGODB_URI not provided"
- Vercel Project Settings → Environment Variables → MONGODB_URI ekleyin
- Deploy'u yeniden tetikleyin (redeploy)

### "Sunucu Hatası"
- Vercel Dashboard → Functions → logs kontrol edin
- MongoDB Atlas bağlantı string'i doğru mu kontrol edin

## Geliştirme (Local)

```bash
npm install
npm run dev
```

Lokal olarak `http://localhost:3000` açılacak. `.env.local` dosyası oluşturup:
```
MONGODB_URI=<atlas-connection-string>
MONGODB_DB=mc_delivery
SECRET_KEY=test-key-123
```
ekleyin.

## Üretim (Production)

Vercel otomatik olarak deploy eder; main branch'e push ettikten sonra:
1. Vercel Actions çalışır
2. `npm run build` ile derlenir
3. API canlı hale gelir (99.99% uptime)
