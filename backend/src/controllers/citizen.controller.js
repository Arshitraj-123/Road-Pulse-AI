import CitizenPoints from '../models/CitizenPoints.js'
import DamageReport from '../models/DamageReport.js'

export const getCitizenDashboard = async (req, res) => {
  const { user } = req

  const [points, myReports, leaderboard] = await Promise.all([
    CitizenPoints.findOne({ citizenId: user._id }),
    DamageReport.find({ reportedBy: user._id })
                 .sort({ createdAt: -1 })
                 .limit(10),
    CitizenPoints.find({ municipalityId: user.municipalityId })
                  .sort({ points: -1 })
                  .limit(10)
                  .populate('citizenId', 'fullName avatarUrl')
  ])

  res.json({
    success: true,
    // Powers "Welcome back, Priya" on citizen portal
    citizen: {
      fullName:  user.fullName,    // "Priya Sharma"
      avatarUrl: user.avatarUrl,
      phone:     user.phone,
    },
    gamification: {
      points:       points?.points || 0,
      totalReports: points?.totalReports || 0,
      level:        points?.level || 'Newcomer',
      badges:       points?.badges || [],
      rank:         points?.rank || 0,
      streak:       points?.streak || 0,
    },
    myReports,
    leaderboard: leaderboard.map((entry, i) => ({
      rank:      i + 1,
      name:      entry.citizenId?.fullName,
      avatarUrl: entry.citizenId?.avatarUrl,
      points:    entry.points,
      level:     entry.level,
      isCurrentUser: entry.citizenId?._id.toString() === user._id.toString()
    }))
  })
}
