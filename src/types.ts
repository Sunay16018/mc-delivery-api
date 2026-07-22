export interface User {
  username: string;
  username_lower: string;
  credits: number;
  registerDate: string;
  ipAddress: string;
  lastWheelSpin?: string;
  isAdmin?: boolean;
  permissions?: string[];
}

export interface Product {
  _id: string;
  price: number;
  commands: string[];
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

export interface PurchaseRequest {
  _id: string;
  status: "pending" | "completed" | "failed";
  username: string;
  productId: string;
  processedAt?: string;
  failReason?: string;
  createdAt: string;
}

export interface CreditRequest {
  _id: string;
  status: "pending" | "completed" | "failed";
  username: string;
  action: "add" | "subtract";
  amount: number;
  createdAt: string;
}

export interface StaffApplication {
  _id: string;
  username: string;
  realName: string;
  age: number;
  discord: string;
  experience: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface AdminStats {
  totalPlayers: number;
  totalProducts: number;
  totalPurchases: number;
  pendingPurchases: number;
  pendingApps: number;
  totalCredits: number;
  recentPurchases: PurchaseRequest[];
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string | Date;
  views: number;
}

export interface Category {
  _id: string;
  name: string;
  imageUrl: string;
}

export interface TicketReply {
  sender: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  username: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  createdAt: string;
  replies: TicketReply[];
}

