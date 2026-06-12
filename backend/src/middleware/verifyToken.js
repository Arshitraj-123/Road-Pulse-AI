import { verifyToken } from '../lib/jwt.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

export const protect = async (req, res, next) => {
  try {
    // Get token from cookie OR Authorization header
    let token = req.cookies.token
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.'
      })
    }
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or is inactive.'
      })
    }

    // Merge JWT-enriched fields onto req.user for downstream controllers
    req.user = user
    if (decoded.municipalityId)      req.user.municipalityId = decoded.municipalityId
    if (decoded.contractorProfileId) req.user.contractorProfileId = decoded.contractorProfileId

    next()
  } catch (err) {
    // Distinguish expired tokens from other JWT errors
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      })
    }
    res.status(401).json({ success: false, message: 'Invalid token.' })
  }
}
