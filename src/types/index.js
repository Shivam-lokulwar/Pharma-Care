// Type definitions for the pharmacy management system

export const Medicine = {
  id: '',
  name: '',
  category: '',
  batch: '',
  expiryDate: '',
  quantity: 0,
  price: 0,
  mrp: 0,
  supplier: '',
  parLevel: 0,
  status: 'in-stock'
};

export const Sale = {
  id: '',
  customerName: '',
  total: 0,
  items: [],
  createdAt: ''
};

export const Supplier = {
  id: '',
  name: '',
  contact: '',
  phone: '',
  active: true
};

export const Prescription = {
  id: '',
  prescriptionNumber: '',
  customer: {},
  status: 'pending',
  createdAt: ''
};

export const DashboardStats = {
  totalMedicines: 0,
  dailySales: 0,
  weeklySales: 0,
  monthlySales: 0,
  lowStockItems: 0,
  expiredItems: 0,
  expiringSoonItems: 0,
  totalSuppliers: 0,
  totalCustomers: 0,
  pendingPrescriptions: 0,
};
