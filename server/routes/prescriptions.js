const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/prescriptions
// @desc    Get all prescriptions with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'dispensed', 'partially-dispensed', 'cancelled']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
  query('customer').optional().isLength({ max: 100 }).withMessage('Customer search term too long'),
  query('doctor').optional().isLength({ max: 100 }).withMessage('Doctor search term too long')
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
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.customer) {
      filter.$or = [
        { 'customer.name': { $regex: req.query.customer, $options: 'i' } },
        { 'customer.phone': { $regex: req.query.customer, $options: 'i' } }
      ];
    }

    if (req.query.doctor) {
      filter['doctor.name'] = { $regex: req.query.doctor, $options: 'i' };
    }

    // Get prescriptions with pagination
    const prescriptions = await Prescription.find(filter)
      .populate('createdBy dispensedBy updatedBy', 'name')
      .populate('medicines.medicine', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prescription.countDocuments(filter);

    res.json({
      success: true,
      data: {
        prescriptions,
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

// @route   GET /api/prescriptions/:id
// @desc    Get single prescription
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('createdBy dispensedBy updatedBy', 'name')
      .populate('medicines.medicine', 'name description batch expiryDate quantity');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: { prescription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/prescriptions
// @desc    Create new prescription
// @access  Private
router.post('/', auth, [
  body('customer.name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Customer name cannot exceed 100 characters'),
  body('customer.phone')
    .notEmpty()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Valid phone number is required'),
  body('customer.email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('doctor.name')
    .notEmpty()
    .withMessage('Doctor name is required')
    .isLength({ max: 100 })
    .withMessage('Doctor name cannot exceed 100 characters'),
  body('doctor.license')
    .notEmpty()
    .withMessage('Doctor license is required')
    .isLength({ max: 20 })
    .withMessage('License number cannot exceed 20 characters'),
  body('medicines')
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),
  body('medicines.*.medicine')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  body('medicines.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('medicines.*.dosage')
    .notEmpty()
    .withMessage('Dosage is required'),
  body('medicines.*.instructions')
    .notEmpty()
    .withMessage('Instructions are required'),
  body('diagnosis')
    .notEmpty()
    .withMessage('Diagnosis is required')
    .isLength({ max: 200 })
    .withMessage('Diagnosis cannot exceed 200 characters'),
  body('validUntil')
    .isISO8601()
    .withMessage('Valid until date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Valid until date must be in the future');
      }
      return true;
    })
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

    // Validate medicines exist
    const medicineIds = req.body.medicines.map(med => med.medicine);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } });

    if (medicines.length !== medicineIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more medicines not found'
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Populate references
    await prescription.populate('createdBy', 'name');
    await prescription.populate('medicines.medicine', 'name description');

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private
router.put('/:id', auth, [
  body('diagnosis')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Diagnosis cannot exceed 200 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority')
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

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('createdBy dispensedBy updatedBy', 'name');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: { prescription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/prescriptions/:id/dispense
// @desc    Dispense medicine from prescription
// @access  Private
router.post('/:id/dispense', auth, [
  body('medicineId')
    .isMongoId()
    .withMessage('Valid medicine ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
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

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Find the medicine in prescription
    const medicineIndex = prescription.medicines.findIndex(
      med => med.medicine.toString() === req.body.medicineId
    );

    if (medicineIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Medicine not found in prescription'
      });
    }

    const medicine = prescription.medicines[medicineIndex];
    const remainingQuantity = medicine.quantity - medicine.dispensed;

    if (req.body.quantity > remainingQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot dispense more than remaining quantity. Available: ${remainingQuantity}`
      });
    }

    // Check medicine stock
    const medicineDoc = await Medicine.findById(req.body.medicineId);
    if (!medicineDoc) {
      return res.status(400).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    if (medicineDoc.quantity < req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${medicineDoc.quantity}`
      });
    }

    // Update prescription
    prescription.medicines[medicineIndex].dispensed += req.body.quantity;
    prescription.updatedBy = req.user.id;

    // Update medicine stock
    medicineDoc.quantity -= req.body.quantity;
    await medicineDoc.save();

    await prescription.save();

    // Populate references
    await prescription.populate('createdBy dispensedBy updatedBy', 'name');
    await prescription.populate('medicines.medicine', 'name description');

    res.json({
      success: true,
      message: 'Medicine dispensed successfully',
      data: { prescription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/prescriptions/:id
// @desc    Delete prescription
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await prescription.deleteOne();

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/prescriptions/status/:status
// @desc    Get prescriptions by status
// @access  Private
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['pending', 'dispensed', 'partially-dispensed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const prescriptions = await Prescription.getByStatus(status);

    res.json({
      success: true,
      data: { prescriptions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/prescriptions/customer/:phone
// @desc    Get prescriptions by customer phone
// @access  Private
router.get('/customer/:phone', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.getByCustomer(req.params.phone);

    res.json({
      success: true,
      data: { prescriptions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/prescriptions/expiring
// @desc    Get expiring prescriptions
// @access  Private
router.get('/expiring', auth, [
  query('days').optional().isInt({ min: 1 }).withMessage('Days must be a positive integer')
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const prescriptions = await Prescription.getExpiring(days);

    res.json({
      success: true,
      data: { prescriptions }
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

