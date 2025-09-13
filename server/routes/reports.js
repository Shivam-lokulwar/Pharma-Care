const express = require('express');
const { query, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Private
router.get('/sales', auth, [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get sales data
    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('createdBy', 'name');

    // Calculate summary statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.totalItems, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Payment method breakdown
    const paymentMethods = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    // Daily sales breakdown
    const dailySales = {};
    sales.forEach(sale => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { sales: 0, revenue: 0, items: 0 };
      }
      dailySales[date].sales += 1;
      dailySales[date].revenue += sale.total;
      dailySales[date].items += sale.totalItems;
    });

    // Top selling medicines
    const medicineSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!medicineSales[item.medicineName]) {
          medicineSales[item.medicineName] = { quantity: 0, revenue: 0 };
        }
        medicineSales[item.medicineName].quantity += item.quantity;
        medicineSales[item.medicineName].revenue += item.total;
      });
    });

    const topMedicines = Object.entries(medicineSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalRevenue,
          totalItems,
          averageOrderValue
        },
        paymentMethods,
        dailySales: Object.entries(dailySales).map(([date, data]) => ({
          date,
          ...data
        })),
        topMedicines,
        sales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reports/inventory
// @desc    Get inventory report
// @access  Private
router.get('/inventory', auth, async (req, res) => {
  try {
    // Get all medicines with populated references
    const medicines = await Medicine.find()
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'name');

    // Calculate summary statistics
    const totalMedicines = medicines.length;
    const totalValue = medicines.reduce((sum, med) => sum + (med.quantity * med.price), 0);
    const lowStockItems = medicines.filter(med => med.status === 'low-stock').length;
    const expiredItems = medicines.filter(med => med.status === 'expired').length;
    const expiringSoonItems = medicines.filter(med => med.status === 'expiring-soon').length;

    // Category breakdown
    const categoryBreakdown = {};
    medicines.forEach(med => {
      const categoryName = med.category?.name || 'Uncategorized';
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = {
          count: 0,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      categoryBreakdown[categoryName].count += 1;
      categoryBreakdown[categoryName].totalQuantity += med.quantity;
      categoryBreakdown[categoryName].totalValue += med.quantity * med.price;
    });

    // Supplier breakdown
    const supplierBreakdown = {};
    medicines.forEach(med => {
      const supplierName = med.supplier?.name || 'Unknown Supplier';
      if (!supplierBreakdown[supplierName]) {
        supplierBreakdown[supplierName] = {
          count: 0,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      supplierBreakdown[supplierName].count += 1;
      supplierBreakdown[supplierName].totalQuantity += med.quantity;
      supplierBreakdown[supplierName].totalValue += med.quantity * med.price;
    });

    // Status breakdown
    const statusBreakdown = medicines.reduce((acc, med) => {
      acc[med.status] = (acc[med.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalMedicines,
          totalValue,
          lowStockItems,
          expiredItems,
          expiringSoonItems
        },
        categoryBreakdown: Object.entries(categoryBreakdown).map(([name, data]) => ({
          name,
          ...data
        })),
        supplierBreakdown: Object.entries(supplierBreakdown).map(([name, data]) => ({
          name,
          ...data
        })),
        statusBreakdown,
        medicines
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reports/prescriptions
// @desc    Get prescription report
// @access  Private
router.get('/prescriptions', auth, [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get prescriptions data
    const prescriptions = await Prescription.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('createdBy dispensedBy', 'name');

    // Calculate summary statistics
    const totalPrescriptions = prescriptions.length;
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
    const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed').length;
    const partiallyDispensedPrescriptions = prescriptions.filter(p => p.status === 'partially-dispensed').length;

    // Priority breakdown
    const priorityBreakdown = prescriptions.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {});

    // Doctor breakdown
    const doctorBreakdown = {};
    prescriptions.forEach(p => {
      const doctorName = p.doctor.name;
      if (!doctorBreakdown[doctorName]) {
        doctorBreakdown[doctorName] = {
          count: 0,
          pending: 0,
          dispensed: 0,
          partiallyDispensed: 0
        };
      }
      doctorBreakdown[doctorName].count += 1;
      doctorBreakdown[doctorName][p.status] += 1;
    });

    // Medicine breakdown
    const medicineBreakdown = {};
    prescriptions.forEach(p => {
      p.medicines.forEach(med => {
        if (!medicineBreakdown[med.medicineName]) {
          medicineBreakdown[med.medicineName] = {
            prescribed: 0,
            dispensed: 0,
            count: 0
          };
        }
        medicineBreakdown[med.medicineName].prescribed += med.quantity;
        medicineBreakdown[med.medicineName].dispensed += med.dispensed;
        medicineBreakdown[med.medicineName].count += 1;
      });
    });

    // Daily breakdown
    const dailyBreakdown = {};
    prescriptions.forEach(p => {
      const date = p.createdAt.toISOString().split('T')[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          total: 0,
          pending: 0,
          dispensed: 0,
          partiallyDispensed: 0
        };
      }
      dailyBreakdown[date].total += 1;
      dailyBreakdown[date][p.status] += 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalPrescriptions,
          pendingPrescriptions,
          dispensedPrescriptions,
          partiallyDispensedPrescriptions
        },
        priorityBreakdown,
        doctorBreakdown: Object.entries(doctorBreakdown).map(([name, data]) => ({
          name,
          ...data
        })),
        medicineBreakdown: Object.entries(medicineBreakdown).map(([name, data]) => ({
          name,
          ...data
        })),
        dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
          date,
          ...data
        })),
        prescriptions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reports/suppliers
// @desc    Get supplier report
// @access  Private
router.get('/suppliers', auth, async (req, res) => {
  try {
    // Get all suppliers
    const suppliers = await Supplier.find()
      .populate('createdBy', 'name');

    // Get medicines for each supplier
    const supplierData = await Promise.all(
      suppliers.map(async (supplier) => {
        const medicines = await Medicine.find({ supplier: supplier._id })
          .populate('category', 'name');

        const totalMedicines = medicines.length;
        const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);
        const totalValue = medicines.reduce((sum, med) => sum + (med.quantity * med.price), 0);
        const lowStockMedicines = medicines.filter(med => med.status === 'low-stock').length;
        const expiredMedicines = medicines.filter(med => med.status === 'expired').length;

        return {
          ...supplier.toObject(),
          statistics: {
            totalMedicines,
            totalQuantity,
            totalValue,
            lowStockMedicines,
            expiredMedicines
          },
          medicines
        };
      })
    );

    // Calculate summary statistics
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.active).length;
    const totalMedicines = supplierData.reduce((sum, s) => sum + s.statistics.totalMedicines, 0);
    const totalValue = supplierData.reduce((sum, s) => sum + s.statistics.totalValue, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalSuppliers,
          activeSuppliers,
          totalMedicines,
          totalValue
        },
        suppliers: supplierData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reports/dashboard
// @desc    Get dashboard summary report
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Get various statistics
    const [
      totalMedicines,
      lowStockMedicines,
      expiredMedicines,
      expiringSoonMedicines,
      totalSuppliers,
      activeSuppliers,
      totalCategories,
      pendingPrescriptions,
      dailySales,
      weeklySales,
      monthlySales,
      totalSales
    ] = await Promise.all([
      Medicine.countDocuments(),
      Medicine.countDocuments({ status: 'low-stock' }),
      Medicine.countDocuments({ status: 'expired' }),
      Medicine.countDocuments({ status: 'expiring-soon' }),
      Supplier.countDocuments(),
      Supplier.countDocuments({ active: true }),
      Category.countDocuments({ active: true }),
      Prescription.countDocuments({ status: { $in: ['pending', 'partially-dispensed'] } }),
      Sale.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Sale.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        medicines: {
          total: totalMedicines,
          lowStock: lowStockMedicines,
          expired: expiredMedicines,
          expiringSoon: expiringSoonMedicines
        },
        suppliers: {
          total: totalSuppliers,
          active: activeSuppliers
        },
        categories: {
          total: totalCategories
        },
        prescriptions: {
          pending: pendingPrescriptions
        },
        sales: {
          daily: {
            amount: dailySales[0]?.total || 0,
            count: dailySales[0]?.count || 0
          },
          weekly: {
            amount: weeklySales[0]?.total || 0,
            count: weeklySales[0]?.count || 0
          },
          monthly: {
            amount: monthlySales[0]?.total || 0,
            count: monthlySales[0]?.count || 0
          },
          total: {
            count: totalSales
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

