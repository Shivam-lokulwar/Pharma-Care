// Data structure definitions for the pharmacy management system

// Medicine status constants
export const MEDICINE_STATUS = {
  IN_STOCK: 'in-stock',
  LOW_STOCK: 'low-stock',
  EXPIRING_SOON: 'expiring-soon',
  EXPIRED: 'expired'
};

// User role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

// Prescription status constants
export const PRESCRIPTION_STATUS = {
  PENDING: 'pending',
  DISPENSED: 'dispensed',
  PARTIALLY_DISPENSED: 'partially-dispensed'
};

// Notification types
export const NOTIFICATION_TYPES = {
  EXPIRY: 'expiry',
  LOW_STOCK: 'low-stock',
  RESTOCK: 'restock',
  PRESCRIPTION: 'prescription'
};

// Default values for forms
export const DEFAULT_VALUES = {
  MEDICINE: {
    name: '',
    category: '',
    batch: '',
    expiryDate: '',
    quantity: 0,
    price: 0,
    mrp: 0,
    supplier: '',
    parLevel: 0,
    status: MEDICINE_STATUS.IN_STOCK
  },
  CATEGORY: {
    name: '',
    description: '',
    active: true
  },
  SUPPLIER: {
    name: '',
    contact: '',
    email: '',
    address: '',
    active: true
  },
  SALE: {
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    customerName: ''
  },
  PRESCRIPTION: {
    customerName: '',
    doctorName: '',
    medicines: [],
    notes: '',
    status: PRESCRIPTION_STATUS.PENDING
  },
  USER: {
    username: '',
    email: '',
    password: '',
    name: '',
    role: USER_ROLES.STAFF,
    active: true
  }
};

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    minLength: 6
  },
  EMAIL: {
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  PHONE: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/
  },
  MEDICINE_NAME: {
    maxLength: 100
  },
  BATCH: {
    maxLength: 50
  },
  CATEGORY_NAME: {
    maxLength: 50
  },
  SUPPLIER_NAME: {
    maxLength: 100
  }
};

