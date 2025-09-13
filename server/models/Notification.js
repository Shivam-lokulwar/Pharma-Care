const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['expiry', 'low-stock', 'restock', 'prescription', 'system', 'alert'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
notificationSchema.index({ type: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ targetUsers: 1 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
});

// Pre-save middleware to set default expiration
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set default expiration to 30 days
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function(userId) {
  this.read = true;
  this.readAt = new Date();
  this.readBy = userId;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(notificationData) {
  return this.create(notificationData);
};

// Static method to get notifications for user
notificationSchema.statics.getForUser = function(userId, options = {}) {
  const query = {
    $or: [
      { targetUsers: userId },
      { targetUsers: { $size: 0 } } // Global notifications
    ]
  };

  if (options.unreadOnly) {
    query.read = false;
  }

  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .populate('createdBy readBy', 'name')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    {
      $or: [
        { targetUsers: userId },
        { targetUsers: { $size: 0 } }
      ],
      read: false
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
        readBy: userId
      }
    }
  );
};

// Static method to get notification counts
notificationSchema.statics.getCounts = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { targetUsers: userId },
          { targetUsers: { $size: 0 } }
        ]
      }
    },
    {
      $group: {
        _id: '$read',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanup = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to create system notifications
notificationSchema.statics.createSystemNotification = function(type, title, message, data = {}) {
  return this.create({
    type,
    title,
    message,
    data,
    priority: 'normal',
    createdBy: null // System notification
  });
};

// Static method to create alert notifications
notificationSchema.statics.createAlert = function(type, title, message, targetUsers = [], priority = 'high') {
  return this.create({
    type,
    title,
    message,
    targetUsers,
    priority,
    createdBy: null // System alert
  });
};

module.exports = mongoose.model('Notification', notificationSchema);