const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/prescriptions
// @desc    Get prescriptions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, patient } = req.query;
    
    let query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    // Additional filters
    if (status) query.status = status;
    if (patient && req.user.role !== 'patient') query.patient = patient;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time type');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                     prescription.patient._id.toString() === req.user._id.toString() ||
                     prescription.doctor._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/prescriptions
// @desc    Create new prescription (doctors only)
// @access  Private/Doctor
router.post('/', [
  auth,
  authorize('doctor', 'admin'),
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  body('medications.*.dosage')
    .trim()
    .notEmpty()
    .withMessage('Medication dosage is required'),
  body('medications.*.frequency')
    .isIn([
      'Once daily',
      'Twice daily',
      'Three times daily',
      'Four times daily',
      'Every 4 hours',
      'Every 6 hours',
      'Every 8 hours',
      'As needed'
    ])
    .withMessage('Invalid frequency'),
  body('medications.*.duration')
    .trim()
    .notEmpty()
    .withMessage('Medication duration is required'),
  body('diagnosis')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Diagnosis cannot exceed 1000 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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
      patient, 
      appointment, 
      medications, 
      diagnosis, 
      notes, 
      refillsAllowed, 
      isUrgent 
    } = req.body;

    // Verify patient exists
    const patientUser = await User.findOne({ 
      _id: patient, 
      role: 'patient', 
      isActive: true 
    });

    if (!patientUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive patient'
      });
    }

    // Create prescription
    const prescription = new Prescription({
      patient,
      doctor: req.user._id,
      appointment,
      medications,
      diagnosis,
      notes,
      refillsAllowed: refillsAllowed || 0,
      isUrgent: isUrgent || false
    });

    await prescription.save();

    // Populate the prescription
    await prescription.populate('patient', 'name email phone');
    await prescription.populate('doctor', 'name specialization');
    if (appointment) {
      await prescription.populate('appointment', 'date time type');
    }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private
router.put('/:id', [
  auth,
  body('status')
    .optional()
    .isIn(['active', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                     prescription.doctor.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, notes, refillsAllowed } = req.body;

    // Update fields
    if (status !== undefined) prescription.status = status;
    if (notes !== undefined) prescription.notes = notes;
    if (refillsAllowed !== undefined) prescription.refillsAllowed = refillsAllowed;

    await prescription.save();

    // Populate the prescription
    await prescription.populate('patient', 'name email phone');
    await prescription.populate('doctor', 'name specialization');
    if (prescription.appointment) {
      await prescription.populate('appointment', 'date time type');
    }

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/prescriptions/:id/refill
// @desc    Request prescription refill
// @access  Private
router.post('/:id/refill', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if user is the patient
    if (prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if prescription is active
    if (prescription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Prescription is not active'
      });
    }

    // Check if prescription is expired
    if (prescription.isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Prescription has expired'
      });
    }

    // Check if refills are available
    if (prescription.refillsRemaining <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No refills remaining'
      });
    }

    // Increment refills used
    prescription.refillsUsed += 1;
    await prescription.save();

    res.json({
      success: true,
      message: 'Prescription refill processed successfully',
      data: {
        prescription,
        refillsRemaining: prescription.refillsRemaining
      }
    });

  } catch (error) {
    console.error('Refill prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/prescriptions/:id
// @desc    Cancel prescription
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check permissions (only doctor who created it or admin)
    const canCancel = req.user.role === 'admin' ||
                     prescription.doctor.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status to cancelled instead of deleting
    prescription.status = 'cancelled';
    await prescription.save();

    res.json({
      success: true,
      message: 'Prescription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/prescriptions/stats/summary
// @desc    Get prescription statistics
// @access  Private/Doctor/Admin
router.get('/stats/summary', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const stats = await Prescription.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalPrescriptions = await Prescription.countDocuments(query);
    const urgentPrescriptions = await Prescription.countDocuments({
      ...query,
      isUrgent: true,
      status: 'active'
    });

    const expiringSoon = await Prescription.countDocuments({
      ...query,
      status: 'active',
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    res.json({
      success: true,
      data: {
        totalPrescriptions,
        urgentPrescriptions,
        expiringSoon,
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get prescription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;