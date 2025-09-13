const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/medicines
// @desc    Get all medicines with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('supplier').optional().isMongoId().withMessage('Invalid supplier ID'),
  query('status').optional().isIn(['in-stock', 'low-stock', 'expiring-soon', 'expired']).withMessage('Invalid status')
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
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { batch: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get medicines with pagination
    const medicines = await Medicine.find(filter)
      .populate('category', 'name')
      .populate('supplier', 'name contact')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Medicine.countDocuments(filter);

    res.json({
      success: true,
      data: {
        medicines,
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

// @route   GET /api/medicines/:id
// @desc    Get single medicine
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('category', 'name description')
      .populate('supplier', 'name contact email')
      .populate('createdBy updatedBy', 'name');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: { medicine }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/medicines
// @desc    Create new medicine
// @access  Private (Admin/Staff)
router.post('/', auth, [
  body('name')
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('batch')
    .notEmpty()
    .withMessage('Batch number is required')
    .isLength({ max: 50 })
    .withMessage('Batch number cannot exceed 50 characters'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Valid expiry date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('mrp')
    .isFloat({ min: 0 })
    .withMessage('MRP must be a non-negative number'),
  body('supplier')
    .isMongoId()
    .withMessage('Valid supplier ID is required'),
  body('parLevel')
    .isInt({ min: 0 })
    .withMessage('Par level must be a non-negative integer')
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

    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Verify supplier exists
    const supplier = await Supplier.findById(req.body.supplier);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Create medicine
    const medicine = await Medicine.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Populate references
    await medicine.populate('category supplier createdBy', 'name contact');

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: { medicine }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Private (Admin/Staff)
router.put('/:id', auth, [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('batch')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Batch number cannot exceed 50 characters'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('mrp')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('MRP must be a non-negative number'),
  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Valid supplier ID is required'),
  body('parLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Par level must be a non-negative integer')
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

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('category supplier createdBy updatedBy', 'name contact');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: { medicine }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    await medicine.deleteOne();

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/medicines/status/:status
// @desc    Get medicines by status
// @access  Private
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['in-stock', 'low-stock', 'expiring-soon', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const medicines = await Medicine.getByStatus(status);

    res.json({
      success: true,
      data: { medicines }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/medicines/expiring/:days
// @desc    Get medicines expiring within specified days
// @access  Private
router.get('/expiring/:days', auth, async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    
    if (isNaN(days) || days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Days must be a positive number'
      });
    }

    const medicines = await Medicine.getExpiring(days);

    res.json({
      success: true,
      data: { medicines }
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