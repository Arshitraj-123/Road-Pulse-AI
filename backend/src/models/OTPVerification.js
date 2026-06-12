import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // phone or email
  otp:        { type: String, required: true },
  type:       {
    type: String,
    enum: ['phone', 'email'],
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min
    index: { expireAfterSeconds: 0 } // auto-delete after expiry
  },
  verified:  { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('OTPVerification', otpSchema)
