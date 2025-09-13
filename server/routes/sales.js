const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sales
// @desc    Get all sales with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('customer').optional().isLength({ max: 100 }).withMessage('Customer search term too long'),
  query('paymentStatus').optional().isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid payment status')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    if (req.query.customer) {
      filter.$or = [
        { 'customer.name': { $regex: req.query.customer, $options: 'i' } },
        { 'customer.phone': { $regex: req.query.customer, $options: 'i' } },
        { 'customer.email': { $regex: req.query.customer, $options: 'i' } }
      ];
    }

    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Get sales with pagination
    const sales = await Sale.find(filter)
      .populate('createdBy updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Sale.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
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

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('createdBy updatedBy', 'name')
      .populate('items.medicine', 'name description');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: { sale }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', auth, [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.medicine')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('customer.name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Customer name cannot exceed 100 characters'),
  body('customer.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('customer.email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  body('tax')
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'netbanking', 'cheque'])
    .withMessage('Invalid payment method')
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

    // Validate medicines and check stock
    const medicineIds = req.body.items.map(item => item.medicine);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } });

    if (medicines.length !== medicineIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more medicines not found'
      });
    }

    // Check stock availability and update quantities
    for (let i = 0; i < req.body.items.length; i++) {
      const item = req.body.items[i];
      const medicine = medicines.find(m => m._id.toString() === item.medicine);
      
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`
        });
      }

      // Update medicine quantity
      medicine.quantity -= item.quantity;
      await medicine.save();
    }

    // Calculate totals
    const items = req.body.items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));

    const subtotal = items.reduce((total, item) => total + item.total, 0);
    const discount = req.body.discount || 0;
    const tax = req.body.tax || 0;
    const total = subtotal - discount + tax;

    // Create sale
    const sale = await Sale.create({
      items,
      customer: req.body.customer,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: req.body.paymentMethod || 'cash',
      paymentStatus: 'completed',
      notes: req.body.notes,
      createdBy: req.user.id
    });

    // Populate references
    await sale.populate('createdBy', 'name');
    await sale.populate('items.medicine', 'name description');

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: { sale }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', auth, [
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
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

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: { sale }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Restore medicine quantities
    for (const item of sale.items) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine) {
        medicine.quantity += item.quantity;
        await medicine.save();
      }
    }

    await sale.deleteOne();

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/sales/customer/:phone
// @desc    Get sales by customer phone
// @access  Private
router.get('/customer/:phone', auth, async (req, res) => {
  try {
    const sales = await Sale.getByCustomer(req.params.phone);

    res.json({
      success: true,
      data: { sales }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/sales/date-range
// @desc    Get sales by date range
// @access  Private
router.get('/date-range', auth, [
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

    const sales = await Sale.getByDateRange(req.query.startDate, req.query.endDate);

    res.json({
      success: true,
      data: { sales }
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

