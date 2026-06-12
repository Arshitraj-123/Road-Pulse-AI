import User from '../models/User.js'
import Municipality from '../models/Municipality.js'
import Contractor from '../models/Contractor.js'
import CitizenPoints from '../models/CitizenPoints.js'
import OTPVerification from '../models/OTPVerification.js'
import Alert from '../models/Alert.js'
import { sendTokenResponse } from '../lib/jwt.js'
import { sendSMSOTP } from '../lib/sms.js'
import { sendEmailOTP, notifyAdminNewContractorRequest } from '../lib/mailer.js'

// ─── CITIZEN SIGNUP ────────────────────────────────
export const citizenSignup = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body

    // Check if user already exists
    const existing = await User.findOne({
      $or: [
        { phone: phone || null },
        { email: email || null }
      ]
    })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists with this phone or email.'
      })
    }

    // Create user (unverified)
    const user = await User.create({
      fullName,
      phone,
      email,
      passwordHash: password,
      role: 'citizen',
      isVerified: false,
      municipalityId: req.body.municipalityId || null
    })

    // Create citizen points record
    await CitizenPoints.create({
      citizenId: user._id,
      municipalityId: req.body.municipalityId || null,
      points: 50,  // welcome bonus
      badges: ['newcomer']
    })

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    await OTPVerification.create({
      identifier: phone || email,
      otp,
      type: phone ? 'phone' : 'email'
    })

    // Send OTP via SMS (Twilio) or Email (Nodemailer)
    if (phone) {
      await sendSMSOTP(phone, otp)
    } else {
      await sendEmailOTP(email, otp)
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent. Please verify your account.',
      userId: user._id,
      // Do NOT send token yet — must verify OTP first
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── CITIZEN LOGIN (Request OTP) ───────────────────
export const citizenLogin = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const user = await User.findOne({
      $or: [
        { phone: phone || null },
        { email: email || null }
      ]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please sign up.' });
    }
    
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    await OTPVerification.create({
      identifier: phone || email,
      otp,
      type: phone ? 'phone' : 'email'
    })

    if (phone) await sendSMSOTP(phone, otp)
    else await sendEmailOTP(email, otp)

    res.status(200).json({ success: true, message: 'OTP sent.', userId: user._id })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── VERIFY OTP ────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { identifier, otp, userId } = req.body

    const record = await OTPVerification.findOne({
      identifier,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    })

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      })
    }

    // Mark OTP as used
    record.verified = true
    await record.save()

    // Mark user as verified
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select('-passwordHash')

    // Send JWT token
    const token = sendTokenResponse(user, res)

    // Return user data for frontend
    const citizenPoints = await CitizenPoints.findOne({
      citizenId: user._id
    })

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
      // Citizen-specific data for dashboard
      citizenData: {
        points:       citizenPoints?.points || 50,
        totalReports: citizenPoints?.totalReports || 0,
        level:        citizenPoints?.level || 'Newcomer',
        badges:       citizenPoints?.badges || ['newcomer'],
        rank:         citizenPoints?.rank || 0,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── MUNICIPAL OFFICER LOGIN ────────────────────────
export const municipalLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user with password (normally excluded)
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: 'municipal',
      isActive: true
    }).select('+passwordHash')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No municipal officer account found with this email.'
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    // Fetch municipality data
    const municipality = await Municipality.findById(user.municipalityId)

    // Send token
    const token = sendTokenResponse(user, res)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,    // "Arjun Singh" — shows on dashboard
        email: user.email,
        role: user.role,            // "municipal"
        designation: user.designation, // "Junior Engineer"
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin,
      },
      // Municipality data for dashboard header
      municipalityData: {
        id:   municipality?._id,
        name: municipality?.name,   // "Patna Municipal Corporation"
        city: municipality?.city,   // "Patna"
        stats: municipality?.stats  // totalReports, budget, etc.
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── CONTRACTOR LOGIN ───────────────────────────────
export const contractorLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: 'contractor',
    }).select('+passwordHash')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No contractor account found with this email.'
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      })
    }

    // Fetch contractor profile + performance data
    const contractor = await Contractor.findById(
      user.contractorProfileId
    )

    // Always issue JWT — frontend handles approval routing
    // (pending → /contractor/pending, rejected → /contractor/rejected, etc.)
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = sendTokenResponse(user, res)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,     // "Rajesh Kumar" — shows on dashboard
        email: user.email,
        role: user.role,             // "contractor"
        avatarUrl: user.avatarUrl,
      },
      // Contractor-specific data for work queue dashboard
      contractorData: {
        id:          contractor?._id,
        companyName: contractor?.companyName, // "Alpha Builders"
        grade:       contractor?.performance?.grade,
        openTickets: contractor?.performance?.openTickets,
        resolutionRate: contractor?.performance?.resolutionRate,
        slaCompliance:  contractor?.performance?.slaCompliance,
        approvalStatus: contractor?.approvalStatus || 'pending',
        rejectionReason: contractor?.rejectionReason || null,
        municipalityId: contractor?.municipalityId,
        licenseNumber:  contractor?.licenseNumber,
        submittedAt:    contractor?.createdAt,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


// ─── GET CURRENT USER (/api/auth/me) ───────────────
// Called on every page load to restore session
export const getMe = async (req, res) => {
  try {
    const user = req.user // set by protect middleware

    let roleData = {}

    if (user.role === 'municipal') {
      const municipality = await Municipality.findById(
        user.municipalityId
      )
      roleData = {
        municipalityName: municipality?.name,
        municipalityCity: municipality?.city,
        designation: user.designation,
        stats: municipality?.stats
      }
    }

    if (user.role === 'contractor') {
      const contractor = await Contractor.findById(
        user.contractorProfileId
      )
      roleData = {
        companyName:     contractor?.companyName,
        grade:           contractor?.performance?.grade,
        openTickets:     contractor?.performance?.openTickets,
        approvalStatus:  contractor?.approvalStatus || 'pending',
        rejectionReason: contractor?.rejectionReason || null,
        municipalityId:  contractor?.municipalityId,
        licenseNumber:   contractor?.licenseNumber,
        submittedAt:     contractor?.createdAt,
      }
    }

    if (user.role === 'citizen') {
      const points = await CitizenPoints.findOne({
        citizenId: user._id
      })
      roleData = {
        points:       points?.points || 0,
        totalReports: points?.totalReports || 0,
        level:        points?.level || 'Newcomer',
        badges:       points?.badges || [],
        rank:         points?.rank || 0,
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id:         user._id,
        fullName:   user.fullName,
        email:      user.email,
        phone:      user.phone,
        role:       user.role,
        avatarUrl:  user.avatarUrl,
        isVerified: user.isVerified,
        lastLogin:  user.lastLogin,
      },
      roleData
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── LOGOUT ────────────────────────────────────────
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({ success: true, message: 'Logged out.' })
}

// ─── CONTRACTOR SIGNUP REQUEST ──────────────────────
export const contractorSignupRequest = async (req, res) => {
  try {
    const {
      companyName, licenseNumber, municipalityId,
      contactPerson, email, password
    } = req.body

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      })
    }

    // Create user (inactive until approved)
    const user = await User.create({
      fullName: contactPerson,
      email,
      passwordHash: password,
      role: 'contractor',
      isActive: false,    // blocked until approved
      isVerified: false,
      municipalityId
    })

    // Create contractor profile (pending approval)
    const contractor = await Contractor.create({
      companyName,
      licenseNumber,
      profileId: user._id,
      municipalityId,
      approvalStatus: 'pending',
      contactPerson,
      documents: req.body.documentUrls || []
    })

    // Link contractor profile to user
    user.contractorProfileId = contractor._id
    await user.save({ validateBeforeSave: false })

    // Create an alert for the municipal dashboard
    await Alert.create({
      type: 'info',
      title: 'New contractor request',
      message: `${companyName} has requested portal access`,
      municipalityId,
      source: 'SYSTEM'
    })

    // Notify municipal admin (email)
    await notifyAdminNewContractorRequest(
      municipalityId,
      companyName,
      contactPerson
    )

    res.status(201).json({
      success: true,
      message: 'Request submitted. You will receive an email when approved.',
      applicationId: contractor._id
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
