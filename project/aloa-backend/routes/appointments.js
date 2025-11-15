const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get appointments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, date, doctor, patient, page = 1, limit = 10 } = req.query;
    
    let query = {};

    // Role-based filtering
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    // Additional filters
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    if (doctor && req.user.role !== 'doctor') query.doctor = doctor;
    if (patient && req.user.role === 'admin') query.patient = patient;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, time: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                     appointment.patient._id.toString() === req.user._id.toString() ||
                     appointment.doctor._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', [
  auth,
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format (HH:MM) is required'),
  body('type')
    .isIn([
      'General Consultation',
      'Follow-up',
      'Specialist Consultation',
      'Emergency',
      'Routine Checkup',
      'Lab Results Review'
    ])
    .withMessage('Valid appointment type is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
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

    const { doctor, date, time, type, notes, symptoms } = req.body;

    // Verify doctor exists and is active
    const doctorUser = await User.findOne({ 
      _id: doctor, 
      role: 'doctor', 
      isActive: true 
    });

    if (!doctorUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive doctor'
      });
    }

    // Check if appointment date is in the future
    const appointmentDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (appointmentDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: req.user._id,
      doctor,
      date,
      time,
      type,
      notes,
      symptoms
    });

    await appointment.save();

    // Populate the appointment
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialization phone');

    // Create reminder alert
    try {
      await Alert.createAppointmentReminder(
        appointment._id,
        req.user._id,
        appointment.datetime
      );
    } catch (alertError) {
      console.error('Failed to create appointment reminder:', alertError);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    if (error.message.includes('not available')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', [
  auth,
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('diagnosis')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Diagnosis cannot exceed 1000 characters'),
  body('treatment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Treatment cannot exceed 1000 characters')
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

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                     appointment.patient.toString() === req.user._id.toString() ||
                     appointment.doctor.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, notes, diagnosis, treatment, symptoms } = req.body;

    // Update fields based on user role
    if (status) {
      // Only doctors and admins can mark as completed
      if (status === 'completed' && req.user.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Patients cannot mark appointments as completed'
        });
      }
      appointment.status = status;
    }

    if (notes !== undefined) appointment.notes = notes;
    if (symptoms !== undefined) appointment.symptoms = symptoms;

    // Only doctors can add diagnosis and treatment
    if (req.user.role === 'doctor' || req.user.role === 'admin') {
      if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
      if (treatment !== undefined) appointment.treatment = treatment;
    }

    await appointment.save();

    // Populate the appointment
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialization phone');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const canCancel = req.user.role === 'admin' ||
                     appointment.patient.toString() === req.user._id.toString() ||
                     appointment.doctor.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status to cancelled instead of deleting
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/availability/:doctorId
// @desc    Get doctor availability
// @access  Private
router.get('/availability/:doctorId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const doctorId = req.params.doctorId;

    // Verify doctor exists
    const doctor = await User.findOne({ 
      _id: doctorId, 
      role: 'doctor', 
      isActive: true 
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get booked appointments for the date
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lt: endDate },
      status: 'scheduled'
    }).select('time');

    const bookedTimes = bookedAppointments.map(apt => apt.time);

    // Available time slots (you can customize this)
    const allTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const availableSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));

    res.json({
      success: true,
      data: {
        date,
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization
        },
        availableSlots,
        bookedSlots: bookedTimes
      }
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;