const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: [
      'Once daily',
      'Twice daily',
      'Three times daily',
      'Four times daily',
      'Every 4 hours',
      'Every 6 hours',
      'Every 8 hours',
      'As needed'
    ]
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  instructions: {
    type: String,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  }
});

const prescriptionSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: {
    type: [medicationSchema],
    validate: {
      validator: function(medications) {
        return medications && medications.length > 0;
      },
      message: 'At least one medication is required'
    }
  },
  diagnosis: {
    type: String,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  refillsAllowed: {
    type: Number,
    default: 0,
    min: 0,
    max: 12
  },
  refillsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  expiryDate: {
    type: Date
  },
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ expiryDate: 1 });

// Virtual for refills remaining
prescriptionSchema.virtual('refillsRemaining').get(function() {
  return Math.max(0, this.refillsAllowed - this.refillsUsed);
});

// Virtual for is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Pre-save middleware to set expiry date
prescriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.expiryDate) {
    // Set expiry to 1 year from now by default
    this.expiryDate = new Date();
    this.expiryDate.setFullYear(this.expiryDate.getFullYear() + 1);
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);