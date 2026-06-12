import Municipality from '../models/Municipality.js'
import DamageReport from '../models/DamageReport.js'
import Alert from '../models/Alert.js'
import Contractor from '../models/Contractor.js'
import User from '../models/User.js'
import { sendApprovalEmail, sendRejectionEmail } from '../lib/mailer.js'

export const getMunicipalDashboard = async (req, res) => {
  const { user } = req          // from protect middleware
  const { municipalityId } = user

  const [municipality, reportStats, recentAlerts] =
    await Promise.all([
      Municipality.findById(municipalityId),
      DamageReport.aggregate([
        { $match: { municipalityId } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }}
      ]),
      Alert.find({ municipalityId })
            .sort({ createdAt: -1 })
            .limit(5)
    ])

  res.json({
    success: true,
    // This is what powers "Good morning, Arjun 👋"
    officer: {
      fullName:    user.fullName,      // "Arjun Singh"
      designation: user.designation,   // "Municipal Officer"
      avatarUrl:   user.avatarUrl,
      lastLogin:   user.lastLogin,
    },
    municipality: {
      name: municipality?.name,         // "Patna Municipal Corporation"
      city: municipality?.city,         // "Patna"
    },
    stats: {
      activeReports:    reportStats.find(s => s._id === 'open')?.count || 0,
      resolvedThisWeek: reportStats.find(s => s._id === 'resolved')?.count || 0,
      avgResolutionDays: municipality?.stats?.avgResolutionDays || 0,
      budgetAllocated:  municipality?.stats?.budgetAllocated || 0,
    },
    recentAlerts
  })
}

// ─── GET CONTRACTORS FOR MUNICIPALITY ────────────────
export const getContractors = async (req, res) => {
  try {
    const contractors = await Contractor.find({
      municipalityId: req.user.municipalityId
    }).populate('profileId', 'fullName email')

    res.status(200).json({
      success: true,
      contractors
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── APPROVE / REJECT CONTRACTOR ─────────────────────
export const approveContractor = async (req, res) => {
  try {
    const { approved, reason } = req.body

    const contractor = await Contractor.findById(req.params.id)
    if (!contractor) {
      return res.status(404).json({ success: false, message: 'Contractor not found.' })
    }

    // Security check — officer can only approve their own municipality
    if (contractor.municipalityId.toString() !== req.user.municipalityId.toString()) {
      return res.status(403).json({ success: false, message: 'Not your municipality.' })
    }

    contractor.approvalStatus = approved ? 'approved' : 'rejected'
    if (!approved && reason) {
      contractor.rejectionReason = reason // We'll need to make sure this exists or just rely on passing it to email
    }
    contractor.approvedBy = req.user._id
    contractor.approvedAt = new Date()
    await contractor.save()

    // Activate or keep locked
    if (contractor.profileId) {
      await User.findByIdAndUpdate(contractor.profileId, {
        isActive: approved   // true if approved, false if rejected
      })
    }

    // Send email to contractor
    if (approved) {
      await sendApprovalEmail(contractor)
    } else {
      await sendRejectionEmail(contractor, reason)
    }

    res.json({ success: true, status: contractor.approvalStatus })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
