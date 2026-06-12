import express from 'express'
import { getCitizenDashboard } from '../controllers/citizen.controller.js'
import { protect } from '../middleware/verifyToken.js'
import { requireRole } from '../middleware/requireRole.js'

const router = express.Router()

router.use(protect)
router.use(requireRole('citizen'))

router.get('/dashboard', getCitizenDashboard)

export default router
