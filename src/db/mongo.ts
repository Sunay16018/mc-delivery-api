import { MongoClient, Db, ObjectId } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcryptjs";

// Interfaces
export interface User {
  _id?: any;
  username: string;
  username_lower: string;
  password: string; // bcrypt hash
  credits: number;
  registerDate: Date;
  ipAddress: string;
  isAdmin?: boolean;
  lastWheelSpin?: Date | string;
  permissions?: string[];
}

export interface Product {
  _id?: any;
  price: number;
  commands: string[];
  name: string;
  description: string;
  imageUrl: string;
  category: string; // "Rütbeler" | "Kozmetikler" | "Diğer"
}

export interface PurchaseRequest {
  _id?: any;
  status: "pending" | "completed" | "failed";
  username: string;
  productId: string;
  processedAt?: Date;
  failReason?: string;
  createdAt: Date;
}

export interface CreditRequest {
  _id?: any;
  status: "pending" | "completed" | "failed";
  username: string;
  action: "add" | "subtract";
  amount: number;
  createdAt: Date;
}

export interface Application {
  _id?: any;
  username: string;
  realName: string;
  age: number;
  discord: string;
  experience: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export interface Article {
  _id?: any;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: Date;
  views: number;
}

export interface ChestItem {
  _id?: any;
  username: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  commands: string[];
  status: "in_chest" | "delivered";
  createdAt: Date;
  deliveredAt?: Date;
}

export interface Category {
  _id?: any;
  name: string;
  imageUrl: string;
}

export interface TicketReply {
  sender: string;
  message: string;
  createdAt: Date;
}

export interface SupportTicket {
  _id?: any;
  username: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  createdAt: Date;
  replies: TicketReply[];
}

export interface WheelLog {
  _id?: any;
  username: string;
  reward: string;
  createdAt: Date;
}

// Global DB config
const dbName = "zefircraft";
const MONGODB_URI = process.env.MONGODB_URI;

// Mock database path
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface QueuedCommand {
  _id?: any;
  username: string;
  command: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

interface MockSchema {
  users: User[];
  products: Product[];
  purchase_requests: PurchaseRequest[];
  credit_requests: CreditRequest[];
  applications: Application[];
  command_queue: QueuedCommand[];
  settings: { apiKey: string }[];
  articles: Article[];
  chest_items: ChestItem[];
  categories: Category[];
  support_tickets: SupportTicket[];
  wheel_logs: WheelLog[];
}

// In-Memory & File-based DB state for fallback
let mockDbState: MockSchema = {
  users: [],
  products: [],
  purchase_requests: [],
  credit_requests: [],
  applications: [],
  command_queue: [],
  settings: [{ apiKey: "zefir_secret_key_123" }],
  articles: [],
  chest_items: [],
  categories: [],
  support_tickets: [],
  wheel_logs: []
};

// Seed helper functions
async function getHashedPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 12);
}

function ensureDirectoryExistence(filePath: string) {
  try {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  } catch (err) {
    console.warn("[DB Warnings] Failed to ensure directory existence (this is normal on read-only serverless filesystems):", err);
  }
}

function saveMockDb() {
  try {
    ensureDirectoryExistence(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(mockDbState, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DB Warnings] Failed to write mock database to disk (this is expected on Vercel, state will run in-memory):", err);
  }
}

function loadMockDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      try {
        const data = fs.readFileSync(DB_FILE, "utf-8");
        mockDbState = JSON.parse(data);
      } catch (e) {
        console.error("Error reading fallback database, resetting:", e);
        saveMockDb();
      }
    } else {
      // Seed initial data
      seedInitialMockData();
    }
  } catch (err) {
    console.warn("[DB Warnings] Failed to check mock DB presence on disk, falling back to seeding in-memory:", err);
    seedInitialMockData();
  }
}

async function seedInitialMockData() {
  const adminHash = await getHashedPassword("admin123");
  const playerHash = await getHashedPassword("password123");
  const specialAdminHash = await getHashedPassword("171aaadff6844cd33849fcb3fa11f328b698eef648e0012985f53adb02d08d0b");

  mockDbState.users = [
    {
      username: "ZefirPlayer",
      username_lower: "zefirplayer",
      password: playerHash,
      credits: 120,
      registerDate: new Date(),
      ipAddress: "127.0.0.1"
    },
    {
      username: "admin",
      username_lower: "admin",
      password: adminHash,
      credits: 250,
      registerDate: new Date(),
      ipAddress: "127.0.0.1",
      isAdmin: true
    },
    {
      username: "sunayseyidli01@gmail.com",
      username_lower: "sunayseyidli01@gmail.com",
      password: specialAdminHash,
      credits: 1000,
      registerDate: new Date(),
      ipAddress: "127.0.0.1",
      isAdmin: true
    }
  ];

  mockDbState.products = [
    {
      _id: "prod_1",
      name: "VIP Rütbesi",
      price: 45,
      commands: ["lp user {username} parent add vip", "broadcast &b&l{username} &eVIP rütbesi satın aldı! Tebrikler!"],
      description: "Sunucudaki VIP haklarına sahip olursun. Yeşil yazı rengi, özel kitler ve sunucu doluyken giriş hakkı kazandırır.",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
      category: "Rütbeler"
    },
    {
      _id: "prod_2",
      name: "MVP+ Rütbesi",
      price: 85,
      commands: ["lp user {username} parent add mvp_plus", "broadcast &b&l{username} &eMVP+ rütbesi satın aldı! Kutlarız!"],
      description: "Sunucudaki en prestijli rütbelerden biri! Özel uçuş modu, buz efektleri, benzersiz emojiler ve devasa kiti ile öne çık.",
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80",
      category: "Rütbeler"
    },
    {
      _id: "prod_3",
      name: "10,000 Oyun Parası",
      price: 15,
      commands: ["eco give {username} 10000", "msg {username} Hesabına 10.000 oyun akçesi yatırıldı."],
      description: "Sunucu içi adil ekonomide hızlıca zengin ol. Marketten eşya almak ve ada seviyeni yükseltmek için ekstra kaynak sağlar.",
      imageUrl: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=400&q=80",
      category: "Diğer"
    },
    {
      _id: "prod_4",
      name: "Buz Kristali Kasası Anahtarı (x3)",
      price: 25,
      commands: ["crate give physical ice_crystal 3 {username}"],
      description: "Sunucu kasalarından ultra-nadir buz temalı aletler ve kozmetikler çıkarma şansı veren 3 adet özel anahtar.",
      imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=400&q=80",
      category: "Kozmetikler"
    }
  ];

  mockDbState.purchase_requests = [
    {
      _id: "req_seed_1",
      username: "ErenBey_1",
      productId: "prod_1",
      status: "completed",
      createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
    },
    {
      _id: "req_seed_2",
      username: "AhmetPVP",
      productId: "prod_4",
      status: "completed",
      createdAt: new Date(Date.now() - 45 * 60 * 1000) // 45 mins ago
    },
    {
      _id: "req_seed_3",
      username: "Cemre_9",
      productId: "prod_3",
      status: "completed",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      _id: "req_seed_4",
      username: "MertOyun_",
      productId: "prod_3",
      status: "completed",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    }
  ];
  mockDbState.credit_requests = [];
  mockDbState.applications = [];
  mockDbState.settings = [{ apiKey: "zefir_secret_key_123" }];

  mockDbState.articles = [
    {
      _id: "art_1",
      title: "ZefirCraft Kapılarını Açtı!",
      content: "ZefirCraft Towny sunucumuz 1.16.5 - 1.26.2 sürümlerini desteklemektedir! Birbirinden heyecanlı kasabalar, dengeli bir ekonomi, rütbe kasaları ve yenilenmiş teslimat sistemi sizleri bekliyor. Hemen zefircraft.mcsh.io IP adresi ile aramıza katılın ve bu muhteşem diyarlardaki yerinizi alın!",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      views: 142
    },
    {
      _id: "art_2",
      title: "Mağazada %30 Açılış İndirimi!",
      content: "Sunucumuzun açılışına özel tüm VIP rütbelerinde, kozmetik kasalarında ve oyun parası paketlerinde %30'a varan indirimler aktif edildi! Kredilerinizi yükleyip Mağaza üzerinden sipariş vererek, rütbenizi doğrudan oyun içi sandığınıza (Web Chest) gönderebilir ve dilediğiniz an oyunda aktif edebilirsiniz. Keyifli oyunlar dileriz!",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(Date.now() - 86400000),
      views: 89
    }
  ];
  mockDbState.chest_items = [];

  mockDbState.categories = [
    { _id: "cat_1", name: "Rütbeler", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
    { _id: "cat_2", name: "Kozmetikler", imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=400&q=80" },
    { _id: "cat_3", name: "Kasalar", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80" },
    { _id: "cat_4", name: "Diğer", imageUrl: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=400&q=80" }
  ];

  mockDbState.wheel_logs = [
    { _id: "wheel_log_1", username: "Alperen99", reward: "10 Kredi", createdAt: new Date(Date.now() - 120000) },
    { _id: "wheel_log_2", username: "ErenBey_1", reward: "2 Kredi", createdAt: new Date(Date.now() - 300000) },
    { _id: "wheel_log_3", username: "Cemre_9", reward: "50 Kredi!", createdAt: new Date(Date.now() - 720000) },
    { _id: "wheel_log_4", username: "AhmetPVP", reward: "5 Kredi", createdAt: new Date(Date.now() - 1080000) },
    { _id: "wheel_log_5", username: "MertOyun_", reward: "100 Kredi!", createdAt: new Date(Date.now() - 1500000) }
  ];

  saveMockDb();
}

// Initialize Mock DB
loadMockDb();

// Real MongoDB Client (lazy initialized)
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function getMongoClient(): Promise<{ client: MongoClient; db: Db } | null> {
  if (!MONGODB_URI) return null;
  if (mongoClient && mongoDb) return { client: mongoClient, db: mongoDb };

  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db(dbName);
    console.log("Successfully connected to MongoDB server!");
    return { client: mongoClient, db: mongoDb };
  } catch (err) {
    console.error("Failed to connect to MongoDB, falling back to local JSON DB:", err);
    return null;
  }
}

// Unified generic Database Helper that handles real MongoDB or falls back to simulated database
export class Database {
  static async isMongoConnected(): Promise<boolean> {
    const mongo = await getMongoClient();
    return !!mongo;
  }

  // Configurable secret key
  static async getSecretKey(): Promise<string> {
    if (process.env.SECRET_KEY) {
      return process.env.SECRET_KEY;
    }
    const mongo = await getMongoClient();
    if (mongo) {
      const setting = await mongo.db.collection("settings").findOne({});
      if (setting && setting.apiKey) {
        return setting.apiKey;
      }
      // Insert if not exists
      await mongo.db.collection("settings").insertOne({ apiKey: "zefir_secret_key_123" });
      return "zefir_secret_key_123";
    } else {
      if (!mockDbState.settings || mockDbState.settings.length === 0) {
        mockDbState.settings = [{ apiKey: "zefir_secret_key_123" }];
        saveMockDb();
      }
      return mockDbState.settings[0].apiKey;
    }
  }

  static async setSecretKey(newKey: string): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("settings").updateOne({}, { $set: { apiKey: newKey } }, { upsert: true });
    } else {
      if (!mockDbState.settings || mockDbState.settings.length === 0) {
        mockDbState.settings = [{ apiKey: newKey }];
      } else {
        mockDbState.settings[0].apiKey = newKey;
      }
      saveMockDb();
    }
  }

  // Helper to check user existence in persistent/mock storage
  private static async userExistsInStorage(lowerUsername: string): Promise<boolean> {
    const mongo = await getMongoClient();
    if (mongo) {
      const count = await mongo.db.collection("users").countDocuments({ username_lower: lowerUsername });
      return count > 0;
    } else {
      return mockDbState.users.some(u => u.username_lower === lowerUsername);
    }
  }

  // USER CRUD
  static async findUserByUsername(username: string): Promise<User | null> {
    const lower = username.toLowerCase();

    // Auto-seed special admin user if requested and not present
    if (lower === "sunayseyidli01@gmail.com") {
      const exists = await this.userExistsInStorage(lower);
      if (!exists) {
        const specialHash = await bcrypt.hash("171aaadff6844cd33849fcb3fa11f328b698eef648e0012985f53adb02d08d0b", 12);
        const newUser: User = {
          username: "sunayseyidli01@gmail.com",
          username_lower: "sunayseyidli01@gmail.com",
          password: specialHash,
          credits: 1000,
          registerDate: new Date(),
          ipAddress: "127.0.0.1",
          isAdmin: true
        };
        await this.createUser(newUser);
      }
    }

    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("users").findOne({ username_lower: lower })) as User | null;
    } else {
      const user = mockDbState.users.find(u => u.username_lower === lower);
      return user ? { ...user } : null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("users").find({}).toArray()) as User[];
    } else {
      return [...mockDbState.users];
    }
  }

  static async createUser(user: User): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").insertOne({
        ...user,
        registerDate: new Date(user.registerDate)
      });
    } else {
      const exists = mockDbState.users.some(u => u.username_lower === user.username_lower);
      if (!exists) {
        mockDbState.users.push({ ...user, _id: "user_" + Date.now() });
        saveMockDb();
      }
    }
  }

  static async updateUserCredits(username: string, newCredits: number): Promise<void> {
    const lower = username.toLowerCase();
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").updateOne(
        { username_lower: lower },
        { $set: { credits: newCredits } }
      );
    } else {
      const user = mockDbState.users.find(u => u.username_lower === lower);
      if (user) {
        user.credits = newCredits;
        saveMockDb();
      }
    }
  }

  static async updateUserWheelSpin(username: string, date: Date, newCredits: number): Promise<void> {
    const lower = username.toLowerCase();
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").updateOne(
        { username_lower: lower },
        { $set: { lastWheelSpin: date, credits: newCredits } }
      );
    } else {
      const user = mockDbState.users.find(u => u.username_lower === lower);
      if (user) {
        user.lastWheelSpin = date;
        user.credits = newCredits;
        saveMockDb();
      }
    }
  }

  static async updateUserPassword(username: string, newPasswordHash: string): Promise<void> {
    const lower = username.toLowerCase();
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").updateOne(
        { username_lower: lower },
        { $set: { password: newPasswordHash } }
      );
    } else {
      const user = mockDbState.users.find(u => u.username_lower === lower);
      if (user) {
        user.password = newPasswordHash;
        saveMockDb();
      }
    }
  }

  // PRODUCT CRUD
  static async getAllProducts(): Promise<Product[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("products").find({}).toArray()) as Product[];
    } else {
      return [...mockDbState.products];
    }
  }

  static async findProductById(id: string): Promise<Product | null> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        return (await mongo.db.collection("products").findOne({ _id: new ObjectId(id) })) as Product | null;
      } catch {
        return (await mongo.db.collection("products").findOne({ _id: id as any })) as Product | null;
      }
    } else {
      const prod = mockDbState.products.find(p => String(p._id) === String(id));
      return prod ? { ...prod } : null;
    }
  }

  static async createProduct(prod: Omit<Product, "_id">): Promise<Product> {
    const mongo = await getMongoClient();
    if (mongo) {
      const result = await mongo.db.collection("products").insertOne(prod);
      return { ...prod, _id: result.insertedId } as Product;
    } else {
      const newProd: Product = {
        ...prod,
        _id: "prod_" + Date.now()
      };
      mockDbState.products.push(newProd);
      saveMockDb();
      return newProd;
    }
  }

  static async updateProduct(id: string, updates: Partial<Omit<Product, "_id">>): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updates });
      } catch {
        await mongo.db.collection("products").updateOne({ _id: id as any }, { $set: updates });
      }
    } else {
      const index = mockDbState.products.findIndex(p => String(p._id) === String(id));
      if (index !== -1) {
        mockDbState.products[index] = { ...mockDbState.products[index], ...updates };
        saveMockDb();
      }
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("products").deleteOne({ _id: new ObjectId(id) });
      } catch {
        await mongo.db.collection("products").deleteOne({ _id: id as any });
      }
    } else {
      mockDbState.products = mockDbState.products.filter(p => String(p._id) !== String(id));
      saveMockDb();
    }
  }

  // CATEGORIES CRUD
  static async getAllCategories(): Promise<Category[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      const cats = (await mongo.db.collection("categories").find({}).toArray()) as any[];
      if (cats.length === 0) {
        const initial = [
          { name: "Rütbeler", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
          { name: "Kozmetikler", imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=400&q=80" },
          { name: "Kasalar", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80" },
          { name: "Diğer", imageUrl: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=400&q=80" }
        ];
        await mongo.db.collection("categories").insertMany(initial);
        return (await mongo.db.collection("categories").find({}).toArray()) as any[];
      }
      return cats;
    } else {
      if (!mockDbState.categories || mockDbState.categories.length === 0) {
        mockDbState.categories = [
          { _id: "cat_1", name: "Rütbeler", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
          { _id: "cat_2", name: "Kozmetikler", imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=400&q=80" },
          { _id: "cat_3", name: "Kasalar", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80" },
          { _id: "cat_4", name: "Diğer", imageUrl: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=400&q=80" }
        ];
        saveMockDb();
      }
      return [...mockDbState.categories];
    }
  }

  static async createCategory(cat: Omit<Category, "_id">): Promise<Category> {
    const mongo = await getMongoClient();
    if (mongo) {
      const result = await mongo.db.collection("categories").insertOne(cat);
      return { ...cat, _id: result.insertedId } as any;
    } else {
      const newCat: Category = {
        ...cat,
        _id: "cat_" + Date.now()
      };
      if (!mockDbState.categories) mockDbState.categories = [];
      mockDbState.categories.push(newCat);
      saveMockDb();
      return newCat;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("categories").deleteOne({ _id: new ObjectId(id) });
      } catch {
        await mongo.db.collection("categories").deleteOne({ _id: id as any });
      }
    } else {
      if (mockDbState.categories) {
        mockDbState.categories = mockDbState.categories.filter(c => String(c._id) !== String(id));
        saveMockDb();
      }
    }
  }

  // PURCHASE REQUESTS
  static async getAllPurchaseRequests(): Promise<PurchaseRequest[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("purchase_requests").find({}).sort({ createdAt: -1 }).toArray()) as PurchaseRequest[];
    } else {
      return [...mockDbState.purchase_requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  static async createPurchaseRequest(req: Omit<PurchaseRequest, "_id">): Promise<PurchaseRequest> {
    const mongo = await getMongoClient();
    if (mongo) {
      const result = await mongo.db.collection("purchase_requests").insertOne(req);
      return { ...req, _id: result.insertedId } as PurchaseRequest;
    } else {
      const newReq: PurchaseRequest = {
        ...req,
        _id: "req_" + Date.now()
      };
      mockDbState.purchase_requests.push(newReq);
      saveMockDb();
      return newReq;
    }
  }

  static async updatePurchaseRequestStatus(id: string, status: "completed" | "failed", failReason?: string): Promise<void> {
    const mongo = await getMongoClient();
    const updates: any = { status, processedAt: new Date() };
    if (failReason) updates.failReason = failReason;

    if (mongo) {
      try {
        await mongo.db.collection("purchase_requests").updateOne({ _id: new ObjectId(id) }, { $set: updates });
      } catch {
        await mongo.db.collection("purchase_requests").updateOne({ _id: id as any }, { $set: updates });
      }
    } else {
      const index = mockDbState.purchase_requests.findIndex(p => String(p._id) === String(id));
      if (index !== -1) {
        mockDbState.purchase_requests[index] = { ...mockDbState.purchase_requests[index], ...updates };
        saveMockDb();
      }
    }
  }

  // CREDIT REQUESTS
  static async getAllCreditRequests(): Promise<CreditRequest[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("credit_requests").find({}).sort({ createdAt: -1 }).toArray()) as CreditRequest[];
    } else {
      return [...mockDbState.credit_requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  static async createCreditRequest(req: Omit<CreditRequest, "_id">): Promise<CreditRequest> {
    const mongo = await getMongoClient();
    if (mongo) {
      const result = await mongo.db.collection("credit_requests").insertOne(req);
      return { ...req, _id: result.insertedId } as CreditRequest;
    } else {
      const newReq: CreditRequest = {
        ...req,
        _id: "creq_" + Date.now()
      };
      mockDbState.credit_requests.push(newReq);
      saveMockDb();
      return newReq;
    }
  }

  static async updateCreditRequestStatus(id: string, status: "completed" | "failed"): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("credit_requests").updateOne({ _id: new ObjectId(id) }, { $set: { status } });
      } catch {
        await mongo.db.collection("credit_requests").updateOne({ _id: id as any }, { $set: { status } });
      }
    } else {
      const index = mockDbState.credit_requests.findIndex(p => String(p._id) === String(id));
      if (index !== -1) {
        mockDbState.credit_requests[index].status = status;
        saveMockDb();
      }
    }
  }

  // APPLICATIONS
  static async getAllApplications(): Promise<Application[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("applications").find({}).sort({ createdAt: -1 }).toArray()) as Application[];
    } else {
      return [...mockDbState.applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  static async createApplication(app: Omit<Application, "_id">): Promise<Application> {
    const mongo = await getMongoClient();
    if (mongo) {
      const result = await mongo.db.collection("applications").insertOne(app);
      return { ...app, _id: result.insertedId } as Application;
    } else {
      const newApp: Application = {
        ...app,
        _id: "app_" + Date.now()
      };
      mockDbState.applications.push(newApp);
      saveMockDb();
      return newApp;
    }
  }

  static async updateApplicationStatus(id: string, status: "accepted" | "rejected"): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("applications").updateOne({ _id: new ObjectId(id) }, { $set: { status } });
      } catch {
        await mongo.db.collection("applications").updateOne({ _id: id as any }, { $set: { status } });
      }
    } else {
      const index = mockDbState.applications.findIndex(p => String(p._id) === String(id));
      if (index !== -1) {
        mockDbState.applications[index].status = status;
        saveMockDb();
      }
    }
  }

  // COMMAND QUEUE (HTTP API)
  static async addCommandToQueue(username: string, command: string): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("command_queue").insertOne({
        username,
        command,
        status: "pending",
        createdAt: new Date()
      });
    } else {
      mockDbState.command_queue.push({
        _id: "cmd_" + Date.now() + Math.random().toString(36).substr(2, 5),
        username,
        command,
        status: "pending",
        createdAt: new Date()
      });
      saveMockDb();
    }
  }

  static async getPendingCommands(limit: number): Promise<QueuedCommand[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("command_queue")
        .find({ status: "pending" })
        .limit(limit)
        .toArray()) as QueuedCommand[];
    } else {
      return mockDbState.command_queue
        .filter(c => c.status === "pending")
        .slice(0, limit);
    }
  }

  static async completeCommands(completedIds: string[], failedIds: string[]): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      if (completedIds.length > 0) {
        const objectIds = completedIds.map(id => {
          try { return new ObjectId(id); } catch { return id; }
        });
        await mongo.db.collection("command_queue").updateMany(
          { _id: { $in: objectIds as any } as any },
          { $set: { status: "completed", processedAt: new Date() } }
        );
        // Fallback for string-based IDs
        await mongo.db.collection("command_queue").updateMany(
          { _id: { $in: completedIds as any } as any },
          { $set: { status: "completed", processedAt: new Date() } }
        );
      }
      if (failedIds.length > 0) {
        const objectIds = failedIds.map(id => {
          try { return new ObjectId(id); } catch { return id; }
        });
        await mongo.db.collection("command_queue").updateMany(
          { _id: { $in: objectIds as any } as any },
          { $set: { status: "failed", processedAt: new Date() } }
        );
        // Fallback for string-based IDs
        await mongo.db.collection("command_queue").updateMany(
          { _id: { $in: failedIds as any } as any },
          { $set: { status: "failed", processedAt: new Date() } }
        );
      }
    } else {
      let changed = false;
      mockDbState.command_queue.forEach(c => {
        const strId = String(c._id);
        if (completedIds.includes(strId)) {
          c.status = "completed";
          changed = true;
        } else if (failedIds.includes(strId)) {
          c.status = "failed";
          changed = true;
        }
      });
      if (changed) {
        saveMockDb();
      }
    }
  }

  // ARTICLES
  static async getAllArticles(): Promise<Article[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("articles").find({}).sort({ createdAt: -1 }).toArray()) as Article[];
    } else {
      return [...mockDbState.articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  static async createArticle(article: Omit<Article, "createdAt" | "views">): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("articles").insertOne({
        ...article,
        views: 0,
        createdAt: new Date()
      });
    } else {
      mockDbState.articles.push({
        ...article,
        _id: "art_" + Date.now(),
        views: 0,
        createdAt: new Date()
      });
      saveMockDb();
    }
  }

  static async deleteArticle(id: string): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("articles").deleteOne({ _id: new ObjectId(id) });
      } catch {
        await mongo.db.collection("articles").deleteOne({ _id: id as any });
      }
    } else {
      mockDbState.articles = mockDbState.articles.filter(a => String(a._id) !== String(id));
      saveMockDb();
    }
  }

  // CHEST
  static async getChestItems(username: string): Promise<ChestItem[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("chest_items").find({ username }).toArray()) as ChestItem[];
    } else {
      return mockDbState.chest_items.filter(c => c.username === username);
    }
  }

  static async addChestItem(item: Omit<ChestItem, "createdAt" | "status">): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("chest_items").insertOne({
        ...item,
        status: "in_chest",
        createdAt: new Date()
      });
    } else {
      mockDbState.chest_items.push({
        ...item,
        _id: "chest_" + Date.now() + Math.random().toString(36).substr(2, 5),
        status: "in_chest",
        createdAt: new Date()
      });
      saveMockDb();
    }
  }

  static async deliverChestItem(id: string): Promise<boolean> {
    const mongo = await getMongoClient();
    let item: ChestItem | null = null;

    if (mongo) {
      try {
        item = (await mongo.db.collection("chest_items").findOne({ _id: new ObjectId(id) })) as ChestItem | null;
        if (!item) {
          item = (await mongo.db.collection("chest_items").findOne({ _id: id as any })) as ChestItem | null;
        }
      } catch {
        item = (await mongo.db.collection("chest_items").findOne({ _id: id as any })) as ChestItem | null;
      }
    } else {
      item = mockDbState.chest_items.find(c => String(c._id) === String(id)) || null;
    }

    if (!item || item.status !== "in_chest") return false;

    // Queue commands
    for (const cmd of item.commands) {
      await this.addCommandToQueue(item.username, cmd);
    }

    // Mark as delivered
    if (mongo) {
      try {
        await mongo.db.collection("chest_items").updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: "delivered", deliveredAt: new Date() } }
        );
      } catch {
        await mongo.db.collection("chest_items").updateOne(
          { _id: id as any },
          { $set: { status: "delivered", deliveredAt: new Date() } }
        );
      }
    } else {
      const idx = mockDbState.chest_items.findIndex(c => String(c._id) === String(id));
      if (idx !== -1) {
        mockDbState.chest_items[idx].status = "delivered";
        mockDbState.chest_items[idx].deliveredAt = new Date();
        saveMockDb();
      }
    }

    return true;
  }

  // TOP CREDITS RANKING
  static async getTopCredits(limit: number = 5): Promise<User[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("users")
        .find({})
        .sort({ credits: -1 })
        .limit(limit)
        .toArray()) as User[];
    } else {
      return [...mockDbState.users]
        .sort((a, b) => b.credits - a.credits)
        .slice(0, limit);
    }
  }

  static async updateUserAdminStatus(username: string, isAdmin: boolean): Promise<void> {
    const lower = username.toLowerCase();
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").updateOne(
        { username_lower: lower },
        { $set: { isAdmin } }
      );
    } else {
      const user = mockDbState.users.find(u => u.username_lower === lower);
      if (user) {
        user.isAdmin = isAdmin;
        saveMockDb();
      }
    }
  }

  static async deleteUserByUsername(username: string): Promise<void> {
    const lower = username.toLowerCase();
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").deleteOne({ username_lower: lower });
    } else {
      mockDbState.users = mockDbState.users.filter(u => u.username_lower !== lower);
      saveMockDb();
    }
  }

  static async updatePurchaseRequestStatusById(id: string, status: "pending" | "completed" | "failed"): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("purchase_requests").updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, processedAt: new Date() } }
        );
      } catch {
        await mongo.db.collection("purchase_requests").updateOne(
          { _id: id as any },
          { $set: { status, processedAt: new Date() } }
        );
      }
    } else {
      const idx = mockDbState.purchase_requests.findIndex(p => String(p._id) === String(id));
      if (idx !== -1) {
        mockDbState.purchase_requests[idx].status = status;
        mockDbState.purchase_requests[idx].processedAt = new Date();
        saveMockDb();
      }
    }
  }

  // ONLINE STATUS TRACKING (In-Memory for real-time sync)
  private static onlinePlayers: Set<string> = new Set<string>();

  static isPlayerOnline(username: string): boolean {
    return this.onlinePlayers.has(username.toLowerCase());
  }

  static setPlayerOnline(username: string, isOnline: boolean): void {
    if (isOnline) {
      this.onlinePlayers.add(username.toLowerCase());
    } else {
      this.onlinePlayers.delete(username.toLowerCase());
    }
  }

  static getOnlinePlayers(): string[] {
    return Array.from(this.onlinePlayers);
  }

  static setOnlinePlayersList(players: string[]): void {
    this.onlinePlayers.clear();
    players.forEach(p => this.onlinePlayers.add(p.toLowerCase()));
  }

  // SUPPORT TICKETS CRUD
  static async getAllSupportTickets(): Promise<SupportTicket[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("support_tickets").find({}).sort({ createdAt: -1 }).toArray()) as SupportTicket[];
    } else {
      if (!mockDbState.support_tickets) mockDbState.support_tickets = [];
      return [...mockDbState.support_tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  static async createSupportTicket(ticket: Omit<SupportTicket, "_id" | "replies" | "status" | "createdAt">): Promise<SupportTicket> {
    const mongo = await getMongoClient();
    const newTicket: any = {
      ...ticket,
      status: "open",
      createdAt: new Date(),
      replies: []
    };

    if (mongo) {
      const result = await mongo.db.collection("support_tickets").insertOne(newTicket);
      newTicket._id = result.insertedId;
      return newTicket;
    } else {
      if (!mockDbState.support_tickets) mockDbState.support_tickets = [];
      newTicket._id = "ticket_" + Date.now();
      mockDbState.support_tickets.push(newTicket);
      saveMockDb();
      return newTicket;
    }
  }

  static async addTicketReply(id: string, reply: TicketReply): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("support_tickets").updateOne(
          { _id: new ObjectId(id) },
          { $push: { replies: reply } as any }
        );
      } catch {
        await mongo.db.collection("support_tickets").updateOne(
          { _id: id as any },
          { $push: { replies: reply } as any }
        );
      }
    } else {
      if (!mockDbState.support_tickets) mockDbState.support_tickets = [];
      const ticket = mockDbState.support_tickets.find(t => String(t._id) === String(id));
      if (ticket) {
        if (!ticket.replies) ticket.replies = [];
        ticket.replies.push(reply);
        saveMockDb();
      }
    }
  }

  static async updateTicketStatus(id: string, status: "open" | "closed"): Promise<void> {
    const mongo = await getMongoClient();
    if (mongo) {
      try {
        await mongo.db.collection("support_tickets").updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
      } catch {
        await mongo.db.collection("support_tickets").updateOne(
          { _id: id as any },
          { $set: { status } }
        );
      }
    } else {
      if (!mockDbState.support_tickets) mockDbState.support_tickets = [];
      const ticket = mockDbState.support_tickets.find(t => String(t._id) === String(id));
      if (ticket) {
        ticket.status = status;
        saveMockDb();
      }
    }
  }

  static async updateUserPermissions(username: string, permissions: string[]): Promise<void> {
    const lower = username.toLowerCase();
    const mongo = await getMongoClient();
    if (mongo) {
      await mongo.db.collection("users").updateOne(
        { username_lower: lower },
        { $set: { permissions } }
      );
    } else {
      const user = mockDbState.users.find(u => u.username_lower === lower);
      if (user) {
        user.permissions = permissions;
        saveMockDb();
      }
    }
  }

  static async createWheelLog(username: string, reward: string): Promise<WheelLog> {
    const mongo = await getMongoClient();
    const newLog: WheelLog = {
      username,
      reward,
      createdAt: new Date()
    };

    if (mongo) {
      const res = await mongo.db.collection("wheel_logs").insertOne(newLog);
      newLog._id = res.insertedId;
      return newLog;
    } else {
      if (!mockDbState.wheel_logs) mockDbState.wheel_logs = [];
      newLog._id = "wheel_log_" + Date.now();
      mockDbState.wheel_logs.unshift(newLog); // Prepend to show newest first in mock too
      saveMockDb();
      return newLog;
    }
  }

  static async getRecentWheelLogs(limit = 10): Promise<WheelLog[]> {
    const mongo = await getMongoClient();
    if (mongo) {
      return (await mongo.db.collection("wheel_logs")
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()) as WheelLog[];
    } else {
      if (!mockDbState.wheel_logs) mockDbState.wheel_logs = [];
      return [...mockDbState.wheel_logs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }
  }
}
