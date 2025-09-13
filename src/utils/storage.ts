import { Medicine, Category, Supplier, Sale, Prescription } from '../types';

// Storage keys
const STORAGE_KEYS = {
  MEDICINES: 'pharmacy_medicines',
  CATEGORIES: 'pharmacy_categories',
  SUPPLIERS: 'pharmacy_suppliers',
  SALES: 'pharmacy_sales',
  PRESCRIPTIONS: 'pharmacy_prescriptions',
};

// Generic storage functions
export const getStoredData = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStoredData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Specific storage functions
export const getMedicines = (): Medicine[] => getStoredData<Medicine>(STORAGE_KEYS.MEDICINES);
export const setMedicines = (medicines: Medicine[]): void => setStoredData(STORAGE_KEYS.MEDICINES, medicines);

export const getCategories = (): Category[] => getStoredData<Category>(STORAGE_KEYS.CATEGORIES);
export const setCategories = (categories: Category[]): void => setStoredData(STORAGE_KEYS.CATEGORIES, categories);

export const getSuppliers = (): Supplier[] => getStoredData<Supplier>(STORAGE_KEYS.SUPPLIERS);
export const setSuppliers = (suppliers: Supplier[]): void => setStoredData(STORAGE_KEYS.SUPPLIERS, suppliers);

export const getSales = (): Sale[] => getStoredData<Sale>(STORAGE_KEYS.SALES);
export const setSales = (sales: Sale[]): void => setStoredData(STORAGE_KEYS.SALES, sales);

export const getPrescriptions = (): Prescription[] => getStoredData<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);
export const setPrescriptions = (prescriptions: Prescription[]): void => setStoredData(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);