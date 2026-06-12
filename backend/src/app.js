import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import municipalRoutes from './routes/municipal.routes.js'
import citizenRoutes from './routes/citizen.routes.js'
import contractorRoutes from './routes/contractor.routes.js'
import alertRoutes from './routes/alerts.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true  // allows cookies
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use('/api/auth',       authRoutes)
app.use('/api/municipal',  municipalRoutes)
app.use('/api/citizen',    citizenRoutes)
app.use('/api/contractor', contractorRoutes)
app.use('/api/alerts',     alertRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// Error handler (must be last)
app.use(errorHandler)

export default app
