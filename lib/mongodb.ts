import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error(
    "MONGODB_URI ortam degiskeni tanimli degil. Vercel > Project Settings > Environment Variables kismindan ekleyin."
  );
}
if (!dbName) {
  throw new Error(
    "MONGODB_DB ortam degiskeni tanimli degil. Vercel > Project Settings > Environment Variables kismindan ekleyin."
  );
}

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

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Development'ta hot-reload ile modul her seferinde yeniden yuklenebilir,
  // bu yuzden global'e yaziyoruz ki her reload'da yeni baglanti acilmasin.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production'da (Vercel) modul cache'i zaten warm instance icinde korunur,
  // yine de ekstra guvenlik payi icin global kullaniyoruz.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
