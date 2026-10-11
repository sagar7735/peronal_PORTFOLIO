const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// Connect to database
connectDB()

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow /uploads images
  })
)

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(mongoSanitize())

// Rate limiting on all API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', globalLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Serve uploaded files (public)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' })
)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api', require('./routes/profile'))
app.use('/api', require('./routes/skills'))
app.use('/api', require('./routes/experience'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/services', require('./routes/services'))
app.use('/api/testimonials', require('./routes/testimonials'))
app.use('/api/freelance', require('./routes/freelance'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/analytics', require('./routes/analytics'))

// Upload test (dev only — remove after Step 5 verification)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', require('./routes/uploadTest'))
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`)
})
