import { Medicine, Category, Supplier, Sale, Prescription } from '../types';
import { isExpired, isExpiringSoon } from './dateUtils';

// Initialize mock data if not present
export const initializeMockData = () => {
  if (!localStorage.getItem('pharmacy_categories')) {
    const categories: Category[] = [
      {
        id: '1',
        name: 'Antibiotics',
        description: 'Antimicrobial medications',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Pain Relief',
        description: 'Analgesics and anti-inflammatory drugs',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Vitamins',
        description: 'Vitamin supplements and nutrition',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Heart Medicine',
        description: 'Cardiovascular medications',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Diabetes',
        description: 'Diabetic care medications',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('pharmacy_categories', JSON.stringify(categories));
  }

  if (!localStorage.getItem('pharmacy_suppliers')) {
    const suppliers: Supplier[] = [
      {
        id: '1',
        name: 'MedSupply Co.',
        contact: '+91-9876543210',
        email: 'orders@medsupply.com',
        address: '123 Medical District, Healthcare City, Mumbai 400001',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'PharmaCorp',
        contact: '+91-9876543211',
        email: 'sales@pharmacorp.com',
        address: '456 Pharma Avenue, Medicine Town, Delhi 110001',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'HealthFirst Distributors',
        contact: '+91-9876543212',
        email: 'info@healthfirst.com',
        address: '789 Wellness Street, Remedy City, Bangalore 560001',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(suppliers));
  }

  if (!localStorage.getItem('pharmacy_medicines')) {
    const medicines: Medicine[] = [
      {
        id: '1',
        name: 'Amoxicillin 500mg',
        category: 'Antibiotics',
        batch: 'AMX2024001',
        expiryDate: '2025-06-15',
        quantity: 150,
        price: 125.50,
        mrp: 150.00,
        supplier: 'MedSupply Co.',
        parLevel: 50,
        status: 'in-stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Ibuprofen 400mg',
        category: 'Pain Relief',
        batch: 'IBU2024002',
        expiryDate: '2025-03-10',
        quantity: 25,
        price: 87.50,
        mrp: 105.00,
        supplier: 'PharmaCorp',
        parLevel: 50,
        status: 'low-stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Vitamin D3 1000IU',
        category: 'Vitamins',
        batch: 'VIT2024003',
        expiryDate: '2026-01-20',
        quantity: 200,
        price: 180.00,
        mrp: 220.00,
        supplier: 'HealthFirst Distributors',
        parLevel: 75,
        status: 'in-stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Atorvastatin 20mg',
        category: 'Heart Medicine',
        batch: 'ATO2024004',
        expiryDate: '2025-02-28',
        quantity: 80,
        price: 250.00,
        mrp: 300.00,
        supplier: 'MedSupply Co.',
        parLevel: 40,
        status: 'expiring-soon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Metformin 850mg',
        category: 'Diabetes',
        batch: 'MET2023005',
        expiryDate: '2024-12-15',
        quantity: 0,
        price: 155.50,
        mrp: 187.50,
        supplier: 'PharmaCorp',
        parLevel: 60,
        status: 'expired',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        batch: 'PAR2024006',
        expiryDate: '2025-08-30',
        quantity: 300,
        price: 52.50,
        mrp: 65.00,
        supplier: 'HealthFirst Distributors',
        parLevel: 100,
        status: 'in-stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Update status based on actual dates and quantities
    medicines.forEach(medicine => {
      if (medicine.quantity === 0) {
        medicine.status = 'expired';
      } else if (medicine.quantity <= medicine.parLevel) {
        medicine.status = 'low-stock';
      } else if (isExpired(medicine.expiryDate)) {
        medicine.status = 'expired';
      } else if (isExpiringSoon(medicine.expiryDate)) {
        medicine.status = 'expiring-soon';
      } else {
        medicine.status = 'in-stock';
      }
    });

    localStorage.setItem('pharmacy_medicines', JSON.stringify(medicines));
  }

  if (!localStorage.getItem('pharmacy_sales')) {
    const sales: Sale[] = [
      {
        id: '1',
        items: [
          {
            medicineId: '1',
            medicineName: 'Amoxicillin 500mg',
            quantity: 2,
            price: 150.00,
            total: 300.00,
          },
          {
            medicineId: '6',
            medicineName: 'Paracetamol 500mg',
            quantity: 1,
            price: 65.00,
            total: 65.00,
          },
        ],
        subtotal: 365.00,
        discount: 0,
        tax: 65.70,
        total: 430.70,
        customerName: 'Rajesh Kumar',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        createdBy: 'Staff User',
      },
      {
        id: '2',
        items: [
          {
            medicineId: '3',
            medicineName: 'Vitamin D3 1000IU',
            quantity: 1,
            price: 220.00,
            total: 220.00,
          },
        ],
        subtotal: 220.00,
        discount: 22.00,
        tax: 35.64,
        total: 233.64,
        customerName: 'Priya Sharma',
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        createdBy: 'Admin User',
      },
    ];
    localStorage.setItem('pharmacy_sales', JSON.stringify(sales));
  }

  if (!localStorage.getItem('pharmacy_prescriptions')) {
    const prescriptions: Prescription[] = [
      {
        id: '1',
        customerId: '1',
        customerName: 'Anita Patel',
        doctorName: 'Dr. Ramesh Gupta',
        medicines: [
          {
            medicineId: '1',
            medicineName: 'Amoxicillin 500mg',
            dosage: '500mg',
            quantity: 14,
            instructions: 'Take twice daily with food',
            dispensed: 14,
          },
          {
            medicineId: '2',
            medicineName: 'Ibuprofen 400mg',
            dosage: '400mg',
            quantity: 10,
            instructions: 'Take as needed for pain',
            dispensed: 0,
          },
        ],
        notes: 'Patient has mild penicillin sensitivity',
        status: 'partially-dispensed',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Suresh Reddy',
        doctorName: 'Dr. Kavitha Nair',
        medicines: [
          {
            medicineId: '4',
            medicineName: 'Atorvastatin 20mg',
            dosage: '20mg',
            quantity: 30,
            instructions: 'Take once daily at bedtime',
            dispensed: 0,
          },
        ],
        notes: 'Regular cholesterol management',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
    ];
    localStorage.setItem('pharmacy_prescriptions', JSON.stringify(prescriptions));
  }
};