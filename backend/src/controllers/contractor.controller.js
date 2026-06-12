import Contractor from '../models/Contractor.js'
import DamageReport from '../models/DamageReport.js'

export const getContractorWorkQueue = async (req, res) => {
  const { user } = req

  const contractor = await Contractor.findById(
    user.contractorProfileId
  )

  const tickets = await DamageReport.find({
    assignedTo: contractor._id
  }).sort({ createdAt: -1 })

  res.json({
    success: true,
    // Powers "Work Queue — Alpha Builders" header
    contractor: {
      fullName:    user.fullName,           // "Rajesh Kumar"
      companyName: contractor?.companyName,  // "Alpha Builders"
      grade:       contractor?.performance?.grade,
      avatarUrl:   user.avatarUrl,
    },
    stats: {
      openTickets:    contractor?.performance?.openTickets || 0,
      overdueTickets: tickets.filter(t => t.status === 'overdue').length,
      resolvedThisMonth: tickets.filter(t =>
        t.status === 'resolved' &&
        t.resolvedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      totalEarned: tickets
        .filter(t => t.status === 'resolved')
        .reduce((sum, t) => sum + (t.damage?.costEstimate || 0), 0)
    },
    tickets
  })
}
