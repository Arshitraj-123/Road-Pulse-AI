import Contractor from '../models/Contractor.js'

export const requireApproved = async (req, res, next) => {
  try {
    const contractor = await Contractor.findById(req.user.contractorProfileId)

    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: 'Contractor profile not found.'
      })
    }

    if (contractor.approvalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${contractor.approvalStatus}. Please wait for municipal approval.`,
        approvalStatus: contractor.approvalStatus
      })
    }

    // Attach contractor profile for downstream use
    req.contractor = contractor
    next()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
