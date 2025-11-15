const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const HealthRecord = require('../models/HealthRecord');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/health-records');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter
});

// @route   GET /api/health-records
// @desc    Get health records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    // Additional filters
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await HealthRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/health-records/:id
// @desc    Get health record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                     record.patient._id.toString() === req.user._id.toString() ||
                     (record.doctor && record.doctor._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        record
      }
    });

  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/health-records
// @desc    Create new health record
// @access  Private
router.post('/', [
  auth,
  upload.array('files', 5), // Allow up to 5 files
  body('type')
    .isIn([
      'Lab Results',
      'X-Ray',
      'MRI',
      'CT Scan',
      'Prescription',
      'Medical Report',
      'Vaccination Record',
      'Allergy Information',
      'Surgery Report',
      'Other'
    ])
    .withMessage('Invalid record type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, title, description, date, tags, isPrivate, labValues } = req.body;

    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];

    // Create health record
    const record = new HealthRecord({
      patient: req.user._id,
      doctor: req.user.role === 'doctor' ? req.user._id : undefined,
      type,
      title,
      description,
      date,
      files,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      isPrivate: isPrivate === 'true',
      labValues: labValues ? JSON.parse(labValues) : []
    });

    await record.save();

    // Populate the record
    await record.populate('patient', 'name email');
    if (record.doctor) {
      await record.populate('doctor', 'name specialization');
    }

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: {
        record
      }
    });

  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    console.error('Create health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/health-records/:id
// @desc    Update health record
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters')
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

    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                     record.patient.toString() === req.user._id.toString() ||
                     (record.doctor && record.doctor.toString() === req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { title, description, tags, isPrivate, labValues } = req.body;

    // Update fields
    if (title !== undefined) record.title = title;
    if (description !== undefined) record.description = description;
    if (tags !== undefined) {
      record.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }
    if (isPrivate !== undefined) record.isPrivate = isPrivate;
    if (labValues !== undefined) record.labValues = JSON.parse(labValues);

    await record.save();

    // Populate the record
    await record.populate('patient', 'name email');
    if (record.doctor) {
      await record.populate('doctor', 'name specialization');
    }

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: {
        record
      }
    });

  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/health-records/:id
// @desc    Delete health record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Check permissions
    const canDelete = req.user.role === 'admin' ||
                     record.patient.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated files
    record.files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });

    await HealthRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });

  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/health-records/:id/download/:fileIndex
// @desc    Download health record file
// @access  Private
router.get('/:id/download/:fileIndex', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                     record.patient.toString() === req.user._id.toString() ||
                     (record.doctor && record.doctor.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const fileIndex = parseInt(req.params.fileIndex);
    const file = record.files[fileIndex];

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);

    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;