import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['critical', 'warning', 'info', 'success'],
    required: true
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  source:  {
    type: String,
    enum: ['AI_PREDICTOR', 'SYSTEM', 'MANUAL'],
    default: 'SYSTEM'
  },
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality'
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DamageReport'
  },
  ticketRef: { type: String },
  read:      { type: Boolean, default: false },
  readBy:    [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date }
  }]
}, { timestamps: true })

export default mongoose.model('Alert', alertSchema)
