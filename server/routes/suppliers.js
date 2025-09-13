const express = require('express');
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate('createdBy updatedBy', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { suppliers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get single supplier
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy updatedBy', 'name');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private (Admin/Staff)
router.post('/', auth, [
  body('name')
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ max: 100 })
    .withMessage('Supplier name cannot exceed 100 characters'),
  body('contact')
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid contact number'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters'),
  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please enter a valid GST number'),
  body('panNumber')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please enter a valid PAN number')
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

    // Check if supplier already exists
    const existingSupplier = await Supplier.findOne({
      $or: [
        { email: req.body.email },
        { 'contact': req.body.contact }
      ]
    });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this email or contact already exists'
      });
    }

    // Create supplier
    const supplier = await Supplier.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Populate references
    await supplier.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Admin/Staff)
router.put('/:id', auth, [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supplier name cannot exceed 100 characters'),
  body('contact')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid contact number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters'),
  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please enter a valid GST number'),
  body('panNumber')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please enter a valid PAN number')
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

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: { supplier }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await supplier.deleteOne();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/suppliers/:id/toggle
// @desc    Toggle supplier active status
// @access  Private (Admin/Staff)
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    supplier.active = !supplier.active;
    supplier.updatedBy = req.user.id;
    await supplier.save();

    res.json({
      success: true,
      message: `Supplier ${supplier.active ? 'activated' : 'deactivated'} successfully`,
      data: { supplier }
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

