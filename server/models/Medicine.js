const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  batch: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
    maxlength: [50, 'Batch number cannot exceed 50 characters']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  parLevel: {
    type: Number,
    required: [true, 'Par level is required'],
    min: [0, 'Par level cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Par level must be a whole number'
    }
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'expiring-soon', 'expired'],
    default: 'in-stock'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'],
    default: 'tablet'
  },
  prescription: {
    required: {
      type: Boolean,
      default: false
    }
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
medicineSchema.index({ name: 'text', description: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ supplier: 1 });
medicineSchema.index({ status: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ batch: 1 });

// Virtual for days until expiry
medicineSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const timeDiff = expiry.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for profit margin
medicineSchema.virtual('profitMargin').get(function() {
  return ((this.mrp - this.price) / this.price * 100).toFixed(2);
});

// Pre-save middleware to update status
medicineSchema.pre('save', function(next) {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  if (this.quantity === 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= 30) {
    this.status = 'expiring-soon';
  } else if (this.quantity <= this.parLevel) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  
  next();
});

// Static method to get medicines by status
medicineSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('category supplier', 'name');
};

// Static method to get expiring medicines
medicineSchema.statics.getExpiring = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    expiryDate: { $lte: futureDate, $gt: new Date() },
    quantity: { $gt: 0 }
  }).populate('category supplier', 'name');
};

module.exports = mongoose.model('Medicine', medicineSchema);