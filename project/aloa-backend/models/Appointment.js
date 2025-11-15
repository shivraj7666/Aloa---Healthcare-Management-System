const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: [
      'General Consultation',
      'Follow-up',
      'Specialist Consultation',
      'Emergency',
      'Routine Checkup',
      'Lab Results Review'
    ]
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  symptoms: {
    type: String,
    maxlength: [1000, 'Symptoms cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  treatment: {
    type: String,
    maxlength: [1000, 'Treatment cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ status: 1 });

// Compound index to prevent double booking
appointmentSchema.index({ doctor: 1, date: 1, time: 1, status: 1 });

// Virtual for appointment datetime
appointmentSchema.virtual('datetime').get(function() {
  const date = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Pre-save middleware to check for conflicts
appointmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('date') || this.isModified('time') || this.isModified('doctor')) {
    const conflictingAppointment = await this.constructor.findOne({
      doctor: this.doctor,
      date: this.date,
      time: this.time,
      status: 'scheduled',
      _id: { $ne: this._id }
    });

    if (conflictingAppointment) {
      const error = new Error('Doctor is not available at this time slot');
      error.status = 400;
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);