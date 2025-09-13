const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const Prescription = require('../models/Prescription');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy_management');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Medicine.deleteMany({});
    await Sale.deleteMany({});
    await Prescription.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@pharmacy.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      phone: '+91-9876543210',
      address: '123 Admin Street, City, State 12345'
    });

    // Create staff user
    const staffUser = await User.create({
      username: 'staff',
      email: 'staff@pharmacy.com',
      password: 'staff123',
      name: 'Staff User',
      role: 'staff',
      phone: '+91-9876543211',
      address: '456 Staff Avenue, City, State 12346'
    });

    console.log('👥 Created users');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Antibiotics',
        description: 'Antimicrobial medications',
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Pain Relief',
        description: 'Analgesics and anti-inflammatory drugs',
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Vitamins',
        description: 'Vitamin supplements and nutrition',
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Heart Medicine',
        description: 'Cardiovascular medications',
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Diabetes',
        description: 'Diabetic care medications',
        active: true,
        createdBy: adminUser._id
      }
    ]);

    console.log('📂 Created categories');

    // Create suppliers
    const suppliers = await Supplier.create([
      {
        name: 'MedSupply Co.',
        contact: '+91-9876543210',
        email: 'orders@medsupply.com',
        address: {
          street: '123 Medical District',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        active: true,
        gstNumber: '27ABCDE1234F1Z5',
        createdBy: adminUser._id
      },
      {
        name: 'PharmaCorp',
        contact: '+91-9876543211',
        email: 'sales@pharmacorp.com',
        address: {
          street: '456 Pharma Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        active: true,
        gstNumber: '07FGHIJ5678K2L6',
        createdBy: adminUser._id
      },
      {
        name: 'HealthFirst Distributors',
        contact: '+91-9876543212',
        email: 'info@healthfirst.com',
        address: {
          street: '789 Wellness Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        active: true,
        gstNumber: '29MNOPQ9012R3S7',
        createdBy: adminUser._id
      }
    ]);

    console.log('🏢 Created suppliers');

    // Create medicines
    const medicines = await Medicine.create([
      {
        name: 'Amoxicillin 500mg',
        category: categories[0]._id, // Antibiotics
        batch: 'AMX2024001',
        expiryDate: new Date('2025-06-15'),
        quantity: 150,
        price: 125.50,
        mrp: 150.00,
        supplier: suppliers[0]._id,
        parLevel: 50,
        description: 'Broad-spectrum antibiotic',
        manufacturer: 'ABC Pharma',
        dosage: '500mg',
        form: 'tablet',
        createdBy: adminUser._id
      },
      {
        name: 'Ibuprofen 400mg',
        category: categories[1]._id, // Pain Relief
        batch: 'IBU2024002',
        expiryDate: new Date('2025-03-10'),
        quantity: 25,
        price: 87.50,
        mrp: 105.00,
        supplier: suppliers[1]._id,
        parLevel: 50,
        description: 'Non-steroidal anti-inflammatory drug',
        manufacturer: 'XYZ Pharma',
        dosage: '400mg',
        form: 'tablet',
        createdBy: adminUser._id
      },
      {
        name: 'Vitamin D3 1000IU',
        category: categories[2]._id, // Vitamins
        batch: 'VIT2024003',
        expiryDate: new Date('2026-01-20'),
        quantity: 200,
        price: 180.00,
        mrp: 220.00,
        supplier: suppliers[2]._id,
        parLevel: 75,
        description: 'Vitamin D3 supplement',
        manufacturer: 'Health Plus',
        dosage: '1000IU',
        form: 'capsule',
        createdBy: adminUser._id
      },
      {
        name: 'Atorvastatin 20mg',
        category: categories[3]._id, // Heart Medicine
        batch: 'ATO2024004',
        expiryDate: new Date('2025-02-28'),
        quantity: 80,
        price: 250.00,
        mrp: 300.00,
        supplier: suppliers[0]._id,
        parLevel: 40,
        description: 'Cholesterol-lowering medication',
        manufacturer: 'Cardio Pharma',
        dosage: '20mg',
        form: 'tablet',
        prescription: { required: true },
        createdBy: adminUser._id
      },
      {
        name: 'Metformin 850mg',
        category: categories[4]._id, // Diabetes
        batch: 'MET2023005',
        expiryDate: new Date('2024-12-15'),
        quantity: 0,
        price: 155.50,
        mrp: 187.50,
        supplier: suppliers[1]._id,
        parLevel: 60,
        description: 'Diabetes medication',
        manufacturer: 'Diabetes Care',
        dosage: '850mg',
        form: 'tablet',
        prescription: { required: true },
        createdBy: adminUser._id
      },
      {
        name: 'Paracetamol 500mg',
        category: categories[1]._id, // Pain Relief
        batch: 'PAR2024006',
        expiryDate: new Date('2025-08-30'),
        quantity: 300,
        price: 52.50,
        mrp: 65.00,
        supplier: suppliers[2]._id,
        parLevel: 100,
        description: 'Pain reliever and fever reducer',
        manufacturer: 'Generic Pharma',
        dosage: '500mg',
        form: 'tablet',
        createdBy: adminUser._id
      }
    ]);

    console.log('💊 Created medicines');

    // Create sample sales
    const sales = await Sale.create([
      {
        items: [
          {
            medicine: medicines[0]._id,
            medicineName: medicines[0].name,
            batch: medicines[0].batch,
            quantity: 2,
            price: medicines[0].mrp,
            total: medicines[0].mrp * 2
          },
          {
            medicine: medicines[5]._id,
            medicineName: medicines[5].name,
            batch: medicines[5].batch,
            quantity: 1,
            price: medicines[5].mrp,
            total: medicines[5].mrp * 1
          }
        ],
        customer: {
          name: 'Rajesh Kumar',
          phone: '+91-9876543220',
          email: 'rajesh@example.com'
        },
        subtotal: 365.00,
        discount: 0,
        tax: 65.70,
        total: 430.70,
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        createdBy: staffUser._id
      },
      {
        items: [
          {
            medicine: medicines[2]._id,
            medicineName: medicines[2].name,
            batch: medicines[2].batch,
            quantity: 1,
            price: medicines[2].mrp,
            total: medicines[2].mrp * 1
          }
        ],
        customer: {
          name: 'Priya Sharma',
          phone: '+91-9876543221',
          email: 'priya@example.com'
        },
        subtotal: 220.00,
        discount: 22.00,
        tax: 35.64,
        total: 233.64,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        createdBy: staffUser._id
      }
    ]);

    console.log('🛒 Created sales');

    // Create sample prescriptions
    const prescriptions = await Prescription.create([
      {
        customer: {
          name: 'Anita Patel',
          phone: '+91-9876543222',
          email: 'anita@example.com',
          age: 45,
          gender: 'female'
        },
        doctor: {
          name: 'Dr. Ramesh Gupta',
          license: 'MH12345',
          specialization: 'General Medicine',
          hospital: 'City Hospital'
        },
        medicines: [
          {
            medicine: medicines[0]._id,
            medicineName: medicines[0].name,
            dosage: '500mg',
            quantity: 14,
            instructions: 'Take twice daily with food',
            frequency: 'Twice daily',
            duration: '7 days',
            dispensed: 14
          },
          {
            medicine: medicines[1]._id,
            medicineName: medicines[1].name,
            dosage: '400mg',
            quantity: 10,
            instructions: 'Take as needed for pain',
            frequency: 'As needed',
            duration: '5 days',
            dispensed: 0
          }
        ],
        diagnosis: 'Upper respiratory tract infection',
        notes: 'Patient has mild penicillin sensitivity',
        status: 'partially-dispensed',
        priority: 'normal',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: staffUser._id
      },
      {
        customer: {
          name: 'Suresh Reddy',
          phone: '+91-9876543223',
          email: 'suresh@example.com',
          age: 55,
          gender: 'male'
        },
        doctor: {
          name: 'Dr. Kavitha Nair',
          license: 'KA67890',
          specialization: 'Cardiology',
          hospital: 'Heart Care Center'
        },
        medicines: [
          {
            medicine: medicines[3]._id,
            medicineName: medicines[3].name,
            dosage: '20mg',
            quantity: 30,
            instructions: 'Take once daily at bedtime',
            frequency: 'Once daily',
            duration: '30 days',
            dispensed: 0
          }
        ],
        diagnosis: 'Hypercholesterolemia',
        notes: 'Regular cholesterol management',
        status: 'pending',
        priority: 'normal',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: staffUser._id
      }
    ]);

    console.log('📋 Created prescriptions');

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📂 Categories: ${await Category.countDocuments()}`);
    console.log(`🏢 Suppliers: ${await Supplier.countDocuments()}`);
    console.log(`💊 Medicines: ${await Medicine.countDocuments()}`);
    console.log(`🛒 Sales: ${await Sale.countDocuments()}`);
    console.log(`📋 Prescriptions: ${await Prescription.countDocuments()}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Staff: staff / staff123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();