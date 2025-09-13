const mongoose = require('mongoose');

const prescriptionMedicineSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  instructions: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Instructions cannot exceed 200 characters']
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Frequency cannot exceed 50 characters']
  },
  duration: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
  },
  dispensed: {
    type: Number,
    default: 0,
    min: [0, 'Dispensed quantity cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.quantity;
      },
      message: 'Dispensed quantity cannot exceed prescribed quantity'
    }
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
});

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },
  license: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'License number cannot exceed 20 characters']
  },
  specialization: {
    type: String,
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters']
  },
  hospital: {
    type: String,
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true
  },
  customer: customerSchema,
  doctor: doctorSchema,
  medicines: [prescriptionMedicineSchema],
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Diagnosis cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'dispensed', 'partially-dispensed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  validUntil: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Valid until date must be in the future'
    }
  },
  dispensedAt: {
    type: Date
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
prescriptionSchema.index({ 'customer.phone': 1 });
prescriptionSchema.index({ 'customer.name': 1 });
prescriptionSchema.index({ 'doctor.name': 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ priority: 1 });
prescriptionSchema.index({ validUntil: 1 });
prescriptionSchema.index({ createdAt: -1 });

// Virtual for total medicines count
prescriptionSchema.virtual('totalMedicines').get(function() {
  return this.medicines.length;
});

// Virtual for total quantity prescribed
prescriptionSchema.virtual('totalQuantity').get(function() {
  return this.medicines.reduce((total, med) => total + med.quantity, 0);
});

// Virtual for total quantity dispensed
prescriptionSchema.virtual('totalDispensed').get(function() {
  return this.medicines.reduce((total, med) => total + med.dispensed, 0);
});

// Virtual for completion percentage
prescriptionSchema.virtual('completionPercentage').get(function() {
  if (this.totalQuantity === 0) return 0;
  return Math.round((this.totalDispensed / this.totalQuantity) * 100);
});

// Virtual for days until expiry
prescriptionSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.validUntil);
  const timeDiff = expiry.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Pre-save middleware to generate prescription number
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const count = await this.constructor.countDocuments();
    this.prescriptionNumber = `RX${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to update status based on dispensed quantities
prescriptionSchema.pre('save', function(next) {
  if (this.isModified('medicines')) {
    const totalQuantity = this.medicines.reduce((total, med) => total + med.quantity, 0);
    const totalDispensed = this.medicines.reduce((total, med) => total + med.dispensed, 0);
    
    if (totalDispensed === 0) {
      this.status = 'pending';
    } else if (totalDispensed === totalQuantity) {
      this.status = 'dispensed';
      if (!this.dispensedAt) {
        this.dispensedAt = new Date();
      }
    } else {
      this.status = 'partially-dispensed';
    }
  }
  next();
});

// Static method to get prescriptions by status
prescriptionSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('createdBy dispensedBy', 'name').sort({ createdAt: -1 });
};

// Static method to get prescriptions by customer
prescriptionSchema.statics.getByCustomer = function(customerPhone) {
  return this.find({ 'customer.phone': customerPhone })
    .populate('createdBy dispensedBy', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get expiring prescriptions
prescriptionSchema.statics.getExpiring = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    validUntil: { $lte: futureDate, $gt: new Date() },
    status: { $in: ['pending', 'partially-dispensed'] }
  }).populate('createdBy', 'name').sort({ validUntil: 1 });
};

// Static method to get prescription statistics
prescriptionSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Prescription', prescriptionSchema);