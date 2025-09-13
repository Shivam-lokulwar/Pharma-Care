const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for user
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean'),
  query('type').optional().isIn(['expiry', 'low-stock', 'restock', 'prescription', 'system', 'alert']).withMessage('Invalid notification type')
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
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const options = {
      unreadOnly: req.query.unreadOnly === 'true',
      type: req.query.type,
      limit: limit + skip
    };

    // Get notifications for user
    const notifications = await Notification.getForUser(req.user.id, options);
    const paginatedNotifications = notifications.slice(skip, skip + limit);

    // Get counts
    const counts = await Notification.getCounts(req.user.id);
    const unreadCount = counts.find(c => c._id === false)?.count || 0;
    const readCount = counts.find(c => c._id === true)?.count || 0;

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: notifications.length,
          pages: Math.ceil(notifications.length / limit)
        },
        counts: {
          unread: unreadCount,
          read: readCount,
          total: unreadCount + readCount
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

// @route   GET /api/notifications/:id
// @desc    Get single notification
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('createdBy readBy', 'name');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to this notification
    const hasAccess = notification.targetUsers.length === 0 || 
                     notification.targetUsers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to this notification
    const hasAccess = notification.targetUsers.length === 0 || 
                     notification.targetUsers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsRead(req.user.id);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read for user
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to this notification
    const hasAccess = notification.targetUsers.length === 0 || 
                     notification.targetUsers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
// @access  Private (Admin)
router.post('/', auth, [
  body('type')
    .isIn(['expiry', 'low-stock', 'restock', 'prescription', 'system', 'alert'])
    .withMessage('Invalid notification type'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('Target users must be an array'),
  body('actionUrl')
    .optional()
    .isURL()
    .withMessage('Action URL must be a valid URL')
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

    // Only admin can create notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const notification = await Notification.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const counts = await Notification.getCounts(req.user.id);
    const unreadCount = counts.find(c => c._id === false)?.count || 0;
    const readCount = counts.find(c => c._id === true)?.count || 0;

    // Get notifications by type
    const typeStats = await Notification.aggregate([
      {
        $match: {
          $or: [
            { targetUsers: req.user.id },
            { targetUsers: { $size: 0 } }
          ]
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: ['$read', 0, 1] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: unreadCount + readCount,
        unread: unreadCount,
        read: readCount,
        byType: typeStats
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

// @route   POST /api/notifications/cleanup
// @desc    Clean up expired notifications (Admin only)
// @access  Private (Admin)
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Only admin can cleanup notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const result = await Notification.cleanup();

    res.json({
      success: true,
      message: 'Expired notifications cleaned up',
      data: { deletedCount: result.deletedCount }
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

