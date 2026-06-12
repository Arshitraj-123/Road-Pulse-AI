import mongoose from 'mongoose'

const contractorSchema = new mongoose.Schema({
  companyName:    { type: String, required: true },
  licenseNumber:  { type: String, unique: true },
  profileId:      {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blacklisted'],
    default: 'pending'
  },
  approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:  { type: Date },
  performance: {
    grade:          { type: String, default: 'N/A' },
    resolutionRate: { type: Number, default: 0 },
    openTickets:    { type: Number, default: 0 },
    avgFixDays:     { type: Number, default: 0 },
    slaCompliance:  { type: Number, default: 0 },
    violations:     { type: Number, default: 0 },
    trendHistory:   { type: [Number], default: [] }
  },
  documents:    { type: [String], default: [] },
  contactPerson: { type: String }
}, { timestamps: true })

export default mongoose.model('Contractor', contractorSchema)
