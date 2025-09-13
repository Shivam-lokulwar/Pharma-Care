const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  active: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  sortOrder: {
    type: Number,
    default: 0
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

// Index for better performance
categorySchema.index({ active: 1 });
categorySchema.index({ parentCategory: 1 });

// Virtual for medicine count
categorySchema.virtual('medicineCount', {
  ref: 'Medicine',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Pre-remove middleware to handle cascading deletes
categorySchema.pre('remove', async function(next) {
  try {
    // Check if category has medicines
    const Medicine = mongoose.model('Medicine');
    const medicineCount = await Medicine.countDocuments({ category: this._id });
    
    if (medicineCount > 0) {
      throw new Error('Cannot delete category that has medicines. Please reassign medicines first.');
    }
    
    // Delete subcategories
    await this.constructor.deleteMany({ parentCategory: this._id });
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Category', categorySchema);