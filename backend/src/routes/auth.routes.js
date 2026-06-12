import express from 'express'
import {
  citizenSignup,
  citizenLogin,
  verifyOTP,
  municipalLogin,
  contractorLogin,
  contractorSignupRequest,
  getMe,
  logout
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/verifyToken.js'

const router = express.Router()

router.post('/citizen/signup',     citizenSignup)
router.post('/citizen/login',      citizenLogin)
router.post('/verify-otp',         verifyOTP)
router.post('/municipal/login',    municipalLogin)
router.post('/contractor/login',   contractorLogin)
router.post('/contractor/request', contractorSignupRequest)
router.get ('/me',    protect, getMe)
router.post('/logout', protect, logout)

export default router
