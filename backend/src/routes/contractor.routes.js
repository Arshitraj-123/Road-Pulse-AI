import express from 'express'
import { getContractorWorkQueue } from '../controllers/contractor.controller.js'
import { protect } from '../middleware/verifyToken.js'
import { requireRole } from '../middleware/requireRole.js'
import { requireApproved } from '../middleware/requireApproved.js'

const router = express.Router()

router.use(protect)
router.use(requireRole('contractor'))
router.use(requireApproved)

router.get('/workqueue', getContractorWorkQueue)

export default router
