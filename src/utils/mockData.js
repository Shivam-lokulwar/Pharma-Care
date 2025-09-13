// Mock data for development
export const mockMedicines = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    batch: 'BATCH001',
    expiryDate: '2025-12-31',
    quantity: 100,
    price: 2.50,
    mrp: 3.00,
    supplier: 'ABC Pharma',
    parLevel: 20,
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotics',
    batch: 'BATCH002',
    expiryDate: '2025-06-30',
    quantity: 5,
    price: 15.00,
    mrp: 18.00,
    supplier: 'XYZ Medical',
    parLevel: 10,
    status: 'low-stock'
  }
];

export const mockSales = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    total: 150.00,
    items: [
      { medicineName: 'Paracetamol 500mg', quantity: 2, total: 6.00 }
    ],
    createdAt: new Date().toISOString()
  }
];

export const mockSuppliers = [
  {
    id: '1',
    name: 'Sun Pharma',
    contact: 'contact@sunpharma.com',
    phone: '+91-9876543210',
    active: true
  }
];

export const mockPrescriptions = [
  {
    id: '1',
    prescriptionNumber: 'RX000001',
    customer: {
      name: 'Jane Smith',
      phone: '+1234567890'
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];