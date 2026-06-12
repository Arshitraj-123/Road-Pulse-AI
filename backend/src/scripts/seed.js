import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Load env vars
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

import User from '../models/User.js'
import Municipality from '../models/Municipality.js'
import Contractor from '../models/Contractor.js'
import CitizenPoints from '../models/CitizenPoints.js'
import DamageReport from '../models/DamageReport.js'
import Alert from '../models/Alert.js'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'roadpulse' })
    console.log('MongoDB Connected for seeding')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const importData = async () => {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany()
    await Municipality.deleteMany()
    await Contractor.deleteMany()
    await CitizenPoints.deleteMany()
    await DamageReport.deleteMany()
    await Alert.deleteMany()

    console.log('Data Cleared!')

    // 1. Create Municipality
    const pmc = await Municipality.create({
      name: 'Patna Municipal Corporation',
      city: 'Patna',
      state: 'Bihar',
      code: 'PMC',
      domain: 'patna.gov.in',
      stats: {
        totalReports: 120,
        resolvedReports: 45,
        activeReports: 75,
        avgResolutionDays: 4.2,
        budgetAllocated: 24000000,
        budgetSpent: 5600000
      }
    })

    // 2. Create Users (Admin, Municipal, Citizen)
    const adminPass = 'admin123'
    const demoPass = 'demo123'

    const adminUser = await User.create({
      fullName: 'PMC Admin',
      email: 'admin@patna.gov.in',
      passwordHash: adminPass,
      role: 'admin',
      isActive: true,
      isVerified: true,
      municipalityId: pmc._id
    })

    pmc.adminId = adminUser._id
    await pmc.save()

    const municipalUser = await User.create({
      fullName: 'Arjun Singh',
      email: 'arjun@patna.gov.in',
      passwordHash: demoPass,
      role: 'municipal',
      designation: 'Junior Engineer',
      isActive: true,
      isVerified: true,
      municipalityId: pmc._id
    })

    const citizenUser = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya@gmail.com',
      phone: '9876543210',
      passwordHash: demoPass,
      role: 'citizen',
      isActive: true,
      isVerified: true,
      municipalityId: pmc._id
    })

    await CitizenPoints.create({
      citizenId: citizenUser._id,
      municipalityId: pmc._id,
      points: 450,
      totalReports: 12,
      level: 'Road Warrior',
      badges: ['newcomer', 'hawk-eye'],
      streak: 3,
      rank: 4
    })

    // 3. Create Contractor User & Profile
    const contractorUser = await User.create({
      fullName: 'Rajesh Kumar',
      email: 'alpha@builders.com',
      passwordHash: demoPass,
      role: 'contractor',
      isActive: true,
      isVerified: true,
      municipalityId: pmc._id
    })

    const contractorProfile = await Contractor.create({
      companyName: 'Alpha Builders',
      licenseNumber: 'LIC-2024-ABC',
      profileId: contractorUser._id,
      municipalityId: pmc._id,
      approvalStatus: 'approved',
      approvedBy: adminUser._id,
      approvedAt: new Date(),
      contactPerson: 'Rajesh Kumar',
      performance: {
        grade: 'A',
        resolutionRate: 92,
        openTickets: 5,
        avgFixDays: 2.1,
        slaCompliance: 95,
        violations: 0,
        trendHistory: [85, 88, 90, 92]
      }
    })

    contractorUser.contractorProfileId = contractorProfile._id
    await contractorUser.save()

    // 4. Create Tickets
    const ticket1 = await DamageReport.create({
      ticketId: 'RP-45921',
      location: { lat: 25.5941, lng: 85.1376, address: 'Gandhi Maidan Rd' },
      damage: { severity: 'critical', confidence: 0.95, costEstimate: 12000, daysToFailure: 2, priorityScore: 98 },
      status: 'in_progress',
      source: 'ai_scan',
      assignedTo: contractorProfile._id,
      municipalityId: pmc._id
    })

    const ticket2 = await DamageReport.create({
      ticketId: 'RP-45922',
      location: { lat: 25.611, lng: 85.144, address: 'Frazer Road' },
      damage: { severity: 'moderate', confidence: 0.88, costEstimate: 5000, daysToFailure: 10, priorityScore: 45 },
      status: 'open',
      source: 'citizen',
      reportedBy: citizenUser._id,
      municipalityId: pmc._id
    })

    // 5. Create Alerts
    await Alert.create([
      {
        type: 'critical',
        title: 'SLA Breach Warning',
        message: 'Ticket RP-45921 is approaching SLA limit (4 hours remaining).',
        source: 'SYSTEM',
        municipalityId: pmc._id,
        reportId: ticket1._id,
        ticketRef: 'RP-45921'
      },
      {
        type: 'info',
        title: 'New AI Detection',
        message: 'High severity pothole detected on Frazer Road by dashcam.',
        source: 'AI_PREDICTOR',
        municipalityId: pmc._id,
        reportId: ticket2._id,
        ticketRef: 'RP-45922'
      }
    ])

    console.log('Data Imported successfully!')
    console.log(`\nDemo Accounts:`)
    console.log(`Municipal: arjun@patna.gov.in / demo123`)
    console.log(`Contractor: alpha@builders.com / demo123`)
    console.log(`Citizen: priya@gmail.com / demo123`)
    
    process.exit()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

importData()
