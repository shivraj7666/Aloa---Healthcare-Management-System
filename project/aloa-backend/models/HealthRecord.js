const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: [true, 'Record type is required'],
    enum: [
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
    ]
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Record date is required']
  },
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  labValues: [{
    parameter: String,
    value: String,
    unit: String,
    referenceRange: String,
    status: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical']
    }
  }]
}, {
  timestamps: true
});

// Indexes
healthRecordSchema.index({ patient: 1, date: -1 });
healthRecordSchema.index({ doctor: 1, date: -1 });
healthRecordSchema.index({ type: 1 });
healthRecordSchema.index({ tags: 1 });

// Virtual for file count
healthRecordSchema.virtual('fileCount').get(function() {
  return this.files.length;
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);