import express from 'express'
import { getMunicipalDashboard, getContractors, approveContractor } from '../controllers/municipal.controller.js'
import { protect } from '../middleware/verifyToken.js'
import { requireRole } from '../middleware/requireRole.js'

const router = express.Router()

router.use(protect)
router.use(requireRole('municipal', 'admin'))

router.get('/dashboard', getMunicipalDashboard)
router.get('/contractors', getContractors)
router.patch('/contractors/:id/approve', approveContractor)

export default router
