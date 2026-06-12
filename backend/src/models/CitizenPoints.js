import mongoose from 'mongoose'

const citizenPointsSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality'
  },
  points:       { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  level:        { type: String, default: 'Newcomer' },
  badges:       { type: [String], default: [] },
  streak:       { type: Number, default: 0 },
  rank:         { type: Number, default: 0 },
  lastReportDate: { type: Date }
}, { timestamps: true })

export default mongoose.model('CitizenPoints', citizenPointsSchema)
