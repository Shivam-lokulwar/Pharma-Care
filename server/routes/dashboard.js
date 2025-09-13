const express = require('express');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const Prescription = require('../models/Prescription');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Parallel queries for better performance
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
      totalSales,
      totalCustomers
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
      Sale.countDocuments(),
      Sale.distinct('customer.phone', { 'customer.phone': { $exists: true, $ne: null } })
    ]);

    const stats = {
      medicines: {
        total: totalMedicines,
        lowStock: lowStockMedicines,
        expired: expiredMedicines,
        expiringSoon: expiringSoonMedicines,
        inStock: totalMedicines - lowStockMedicines - expiredMedicines - expiringSoonMedicines
      },
      suppliers: {
        total: totalSuppliers,
        active: activeSuppliers,
        inactive: totalSuppliers - activeSuppliers
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
      },
      customers: {
        total: totalCustomers.length
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/sales-chart
// @desc    Get sales chart data
// @access  Private
router.get('/sales-chart', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const salesData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySales = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: date, $lt: nextDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]);

      salesData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySales[0]?.total || 0,
        transactions: daySales[0]?.count || 0
      });
    }

    res.json({
      success: true,
      data: { salesData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/top-medicines
// @desc    Get top selling medicines
// @access  Private
router.get('/top-medicines', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topMedicines = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          name: { $first: '$items.medicineName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      {
        $project: {
          name: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          salesCount: 1,
          category: { $arrayElemAt: ['$medicine.category', 0] }
        }
      }
    ]);

    res.json({
      success: true,
      data: { topMedicines }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/inventory-distribution
// @desc    Get inventory distribution by category
// @access  Private
router.get('/inventory-distribution', auth, async (req, res) => {
  try {
    const distribution = await Medicine.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$category',
          name: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get dashboard alerts
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = [];

    // Check for expired medicines
    const expiredCount = await Medicine.countDocuments({ status: 'expired' });
    if (expiredCount > 0) {
      alerts.push({
        id: 'expired-medicines',
        type: 'expiry',
        title: 'Expired Medicines',
        message: `${expiredCount} medicines have expired and need to be removed`,
        count: expiredCount,
        priority: 'high',
        actionUrl: '/inventory?filter=expired'
      });
    }

    // Check for expiring soon medicines
    const expiringSoonCount = await Medicine.countDocuments({ status: 'expiring-soon' });
    if (expiringSoonCount > 0) {
      alerts.push({
        id: 'expiring-soon',
        type: 'expiry',
        title: 'Medicines Expiring Soon',
        message: `${expiringSoonCount} medicines will expire within 30 days`,
        count: expiringSoonCount,
        priority: 'medium',
        actionUrl: '/inventory?filter=expiring-soon'
      });
    }

    // Check for low stock medicines
    const lowStockCount = await Medicine.countDocuments({ status: 'low-stock' });
    if (lowStockCount > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'low-stock',
        title: 'Low Stock Items',
        message: `${lowStockCount} medicines are below minimum stock levels`,
        count: lowStockCount,
        priority: 'medium',
        actionUrl: '/inventory?filter=low-stock'
      });
    }

    // Check for pending prescriptions
    const pendingPrescriptions = await Prescription.countDocuments({ 
      status: { $in: ['pending', 'partially-dispensed'] } 
    });
    if (pendingPrescriptions > 0) {
      alerts.push({
        id: 'pending-prescriptions',
        type: 'prescription',
        title: 'Pending Prescriptions',
        message: `${pendingPrescriptions} prescriptions are waiting to be dispensed`,
        count: pendingPrescriptions,
        priority: 'low',
        actionUrl: '/prescriptions'
      });
    }

    res.json({
      success: true,
      data: { alerts }
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