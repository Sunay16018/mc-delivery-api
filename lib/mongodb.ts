import { MongoClient, MongoClientOptions } from "mongodb";

// NOT: MONGODB_URI / MONGODB_DB kontrolunu BURADA (modul yuklenirken) degil,
// getDb() cagrildiginda yapiyoruz. Bu dosya build sirasinda (statik sayfa
// derlemesi, tip kontrolu, vs.) veya env degiskenleri henuz mevcut degilken
// import edilebilir; modul-seviyesinde throw atmak butun build'i veya
// bu modulu (dolayli olarak) import eden her route'u cokertir.
// Boylece hata sadece DB'ye gercekten erisilmeye calisildiginda olusur ve
// duzgun bir JSON hata yaniti donmesine izin verilir.

// Serverless ortamda (Vercel) her fonksiyon cagrisinda yeni baglanti
// acilmasini onlemek icin client promise'ini global nesnede cache'liyoruz.
// Boylece ayni "warm" lambda instance'i ayni baglantiyi tekrar kullanir.
const options: MongoClientOptions = {
  maxPoolSize: 10, // Atlas M0 (Free Tier) toplam baglanti limitini asmamak icin dusuk tutuluyor
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI ortam degiskeni tanimli degil. Vercel > Project Settings > Environment Variables kismindan ekleyin."
    );
  }

  // Development'ta hot-reload ile modul her seferinde yeniden yuklenebilir,
  // production'da (Vercel) da warm lambda instance'lar arasi tekrar
  // kullanim icin global'e yaziyoruz.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDb() {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) {
    throw new Error(
      "MONGODB_DB ortam degiskeni tanimli degil. Vercel > Project Settings > Environment Variables kismindan ekleyin."
    );
  }
  const client = await getClientPromise();
  return client.db(dbName);
}

export default getClientPromise;
