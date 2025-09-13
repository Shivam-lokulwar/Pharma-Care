import { mockMedicines, mockSales, mockSuppliers, mockPrescriptions } from './mockData';

// Storage keys
const STORAGE_KEYS = {
  MEDICINES: 'pharmacy_medicines',
  CATEGORIES: 'pharmacy_categories',
  SUPPLIERS: 'pharmacy_suppliers',
  SALES: 'pharmacy_sales',
  PRESCRIPTIONS: 'pharmacy_prescriptions',
};

// Generic storage functions
export const getStoredData = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Specific storage functions
export const getMedicines = () => {
  const data = getStoredData(STORAGE_KEYS.MEDICINES);
  if (data.length === 0) {
    setMedicines(mockMedicines);
    return mockMedicines;
  }
  return data;
};
export const setMedicines = (medicines) => setStoredData(STORAGE_KEYS.MEDICINES, medicines);

export const getCategories = () => getStoredData(STORAGE_KEYS.CATEGORIES);
export const setCategories = (categories) => setStoredData(STORAGE_KEYS.CATEGORIES, categories);

export const getSuppliers = () => {
  const data = getStoredData(STORAGE_KEYS.SUPPLIERS);
  if (data.length === 0) {
    setSuppliers(mockSuppliers);
    return mockSuppliers;
  }
  return data;
};
export const setSuppliers = (suppliers) => setStoredData(STORAGE_KEYS.SUPPLIERS, suppliers);

export const getSales = () => {
  const data = getStoredData(STORAGE_KEYS.SALES);
  if (data.length === 0) {
    setSales(mockSales);
    return mockSales;
  }
  return data;
};
export const setSales = (sales) => setStoredData(STORAGE_KEYS.SALES, sales);

export const getPrescriptions = () => {
  const data = getStoredData(STORAGE_KEYS.PRESCRIPTIONS);
  if (data.length === 0) {
    setPrescriptions(mockPrescriptions);
    return mockPrescriptions;
  }
  return data;
};
export const setPrescriptions = (prescriptions) => setStoredData(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);

