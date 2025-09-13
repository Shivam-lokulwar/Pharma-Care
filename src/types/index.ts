export interface Medicine {
  id: string;
  name: string;
  category: string;
  batch: string;
  expiryDate: string;
  quantity: number;
  price: number;
  mrp: number;
  supplier: string;
  parLevel: number;
  status: 'in-stock' | 'low-stock' | 'expiring-soon' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  active: boolean;
  createdAt: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  createdBy: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Prescription {
  id: string;
  customerId: string;
  customerName: string;
  doctorName: string;
  medicines: PrescriptionMedicine[];
  notes: string;
  status: 'pending' | 'dispensed' | 'partially-dispensed';
  createdAt: string;
  dispensedAt?: string;
}

export interface PrescriptionMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string;
  quantity: number;
  instructions: string;
  dispensed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  name: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'expiry' | 'low-stock' | 'restock' | 'prescription';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DashboardStats {
  totalMedicines: number;
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  lowStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  totalSuppliers: number;
  totalCustomers: number;
  pendingPrescriptions: number;
}