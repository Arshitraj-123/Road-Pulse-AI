import express from 'express'
import { protect } from '../middleware/verifyToken.js'
import { requireRole } from '../middleware/requireRole.js'

const router = express.Router()

router.use(protect)
router.use(requireRole('municipal', 'admin'))

router.get('/', (req, res) => {
  res.json({ success: true, alerts: [] })
})

export default router
