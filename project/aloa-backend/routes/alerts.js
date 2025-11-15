const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get user alerts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      isRead, 
      type, 
      priority, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = { user: req.user._id };

    // Filters
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;
    if (priority) query.priority = priority;

    // Don't show expired alerts
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const alerts = await Alert.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({
      user: req.user._id,
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.json({
      success: true,
      data: {
        alerts,
        unreadCount,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/alerts/:id
// @desc    Get alert by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if user owns this alert
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        alert
      }
    });

  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/alerts
// @desc    Create new alert (admin only)
// @access  Private/Admin
router.post('/', [
  auth,
  authorize('admin'),
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('type')
    .isIn([
      'appointment',
      'medication',
      'checkup',
      'lab_results',
      'prescription_refill',
      'system',
      'emergency'
    ])
    .withMessage('Invalid alert type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      user,
      type,
      title,
      message,
      priority,
      scheduledFor,
      expiresAt,
      relatedModel,
      relatedId,
      actionUrl,
      metadata
    } = req.body;

    const alert = new Alert({
      user,
      type,
      title,
      message,
      priority: priority || 'medium',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      relatedModel,
      relatedId,
      actionUrl,
      metadata
    });

    await alert.save();

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: {
        alert
      }
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if user owns this alert
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    alert.isRead = true;
    await alert.save();

    res.json({
      success: true,
      message: 'Alert marked as read',
      data: {
        alert
      }
    });

  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/alerts/read-all
// @desc    Mark all alerts as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Alert.updateMany(
      { 
        user: req.user._id, 
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'All alerts marked as read'
    });

  } catch (error) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if user owns this alert or is admin
    const canDelete = req.user.role === 'admin' || 
                     alert.user.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/alerts/stats/summary
// @desc    Get alert statistics (admin only)
// @access  Private/Admin
router.get('/stats/summary', auth, authorize('admin'), async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const unreadAlerts = await Alert.countDocuments({ isRead: false });
    const urgentAlerts = await Alert.countDocuments({ 
      priority: 'urgent', 
      isRead: false 
    });

    const alertsByType = await Alert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const alertsByPriority = await Alert.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalAlerts,
        unreadAlerts,
        urgentAlerts,
        typeBreakdown: alertsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityBreakdown: alertsByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;