import mongoose from 'mongoose'

const municipalitySchema = new mongoose.Schema({
  name:   { type: String, required: true },
  city:   { type: String, required: true },
  state:  { type: String, required: true },
  code:   { type: String, unique: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stats: {
    totalReports:    { type: Number, default: 0 },
    resolvedReports: { type: Number, default: 0 },
    activeReports:   { type: Number, default: 0 },
    avgResolutionDays: { type: Number, default: 0 },
    budgetAllocated: { type: Number, default: 24000000 },
    budgetSpent:     { type: Number, default: 0 },
  },
  domain: { type: String } // patna.gov.in
}, { timestamps: true })

export default mongoose.model('Municipality', municipalitySchema)
