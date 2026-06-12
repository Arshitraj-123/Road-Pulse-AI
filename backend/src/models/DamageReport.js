import mongoose from 'mongoose'

const damageReportSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    default: () => 'RP-' + Math.floor(10000 + Math.random() * 90000)
  },
  location: {
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    address: { type: String }
  },
  damage: {
    type:          { type: String },
    severity:      {
      type: String,
      enum: ['critical', 'moderate', 'minor'],
      default: 'moderate'
    },
    confidence:    { type: Number },
    costEstimate:  { type: Number },
    daysToFailure: { type: Number },
    priorityScore: { type: Number }
  },
  photoUrl:       { type: String },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'overdue'],
    default: 'open'
  },
  source: {
    type: String,
    enum: ['citizen', 'dashcam', 'ai_scan', 'whatsapp'],
    default: 'citizen'
  },
  reportedBy:     {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo:     {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor'
  },
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality',
    required: true
  },
  history: [{
    status:    { type: String },
    note:      { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date, default: null }
}, { timestamps: true })

export default mongoose.model('DamageReport', damageReportSchema)
