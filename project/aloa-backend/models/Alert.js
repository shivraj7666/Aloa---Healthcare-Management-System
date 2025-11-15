const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: [
      'appointment',
      'medication',
      'checkup',
      'lab_results',
      'prescription_refill',
      'system',
      'emergency'
    ]
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  relatedModel: {
    type: String,
    enum: ['Appointment', 'Prescription', 'HealthRecord']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  actionUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ user: 1, isRead: 1, createdAt: -1 });
alertSchema.index({ type: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ scheduledFor: 1 });
alertSchema.index({ expiresAt: 1 });

// Virtual for is expired
alertSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Pre-save middleware to set readAt when marked as read
alertSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to create appointment reminder
alertSchema.statics.createAppointmentReminder = function(appointmentId, userId, appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before

  return this.create({
    user: userId,
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'You have an appointment scheduled for tomorrow.',
    priority: 'medium',
    scheduledFor: reminderDate,
    relatedModel: 'Appointment',
    relatedId: appointmentId,
    expiresAt: appointmentDate
  });
};

module.exports = mongoose.model('Alert', alertSchema);