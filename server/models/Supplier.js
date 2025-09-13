const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid contact number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Zip code cannot exceed 10 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country name cannot exceed 50 characters'],
      default: 'India'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branchName: {
      type: String,
      trim: true
    }
  },
  contactPerson: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Contact person name cannot exceed 50 characters']
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [50, 'Designation cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  paymentTerms: {
    type: String,
    enum: ['cash', 'credit-15', 'credit-30', 'credit-45', 'credit-60'],
    default: 'cash'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
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
supplierSchema.index({ name: 1 });
supplierSchema.index({ email: 1 });
supplierSchema.index({ active: 1 });
supplierSchema.index({ gstNumber: 1 });

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.join(', ');
});

// Virtual for medicine count
supplierSchema.virtual('medicineCount', {
  ref: 'Medicine',
  localField: '_id',
  foreignField: 'supplier',
  count: true
});

// Pre-remove middleware to handle cascading deletes
supplierSchema.pre('remove', async function(next) {
  try {
    // Check if supplier has medicines
    const Medicine = mongoose.model('Medicine');
    const medicineCount = await Medicine.countDocuments({ supplier: this._id });
    
    if (medicineCount > 0) {
      throw new Error('Cannot delete supplier that has medicines. Please reassign medicines first.');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);