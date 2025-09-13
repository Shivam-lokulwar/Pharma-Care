const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
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
  batch: {
    type: String,
    required: true,
    trim: true
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
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
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
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
});

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  customer: customerSchema,
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'cheque'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
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
saleSchema.index({ createdAt: -1 });
saleSchema.index({ 'customer.phone': 1 });
saleSchema.index({ 'customer.email': 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ createdBy: 1 });

// Virtual for total items count
saleSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for profit margin
saleSchema.virtual('profitMargin').get(function() {
  const costTotal = this.items.reduce((total, item) => {
    // Assuming we have cost price stored somewhere
    return total + (item.price * 0.8 * item.quantity); // 20% markup assumption
  }, 0);
  return ((this.total - costTotal) / this.total * 100).toFixed(2);
});

// Pre-save middleware to calculate totals
saleSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
  
  // Calculate total after discount and tax
  const afterDiscount = this.subtotal - this.discount;
  this.total = afterDiscount + this.tax;
  
  next();
});

// Static method to get sales by date range
saleSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate('createdBy', 'name').sort({ createdAt: -1 });
};

// Static method to get sales by customer
saleSchema.statics.getByCustomer = function(customerPhone) {
  return this.find({ 'customer.phone': customerPhone })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get top selling medicines
saleSchema.statics.getTopMedicines = function(limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
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
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Sale', saleSchema);