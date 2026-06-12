import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  // Common fields for ALL roles
  fullName:     { type: String, required: true, trim: true },
  email:        { type: String, unique: true, sparse: true,
                  lowercase: true, trim: true },
  phone:        { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  role: {
    type: String,
    enum: ['citizen', 'municipal', 'contractor', 'admin'],
    required: true
  },
  avatarUrl:    { type: String, default: null },
  isActive:     { type: Boolean, default: true },
  isVerified:   { type: Boolean, default: false },

  // Municipal officer specific
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality',
    default: null
  },
  designation: { type: String, default: null },
  employeeId:  { type: String, default: null },
  invitedBy:   {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Contractor specific
  contractorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor',
    default: null
  },

  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null }
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
})

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash)
}

// Remove passwordHash from JSON responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}

export default mongoose.model('User', userSchema)
