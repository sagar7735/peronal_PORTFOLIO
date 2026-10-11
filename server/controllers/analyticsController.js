const Analytics = require('../models/Analytics')
const asyncHandler = require('../utils/asyncHandler')

// POST /api/analytics/track (public)
exports.trackPageView = asyncHandler(async (req, res) => {
  const { page = '/' } = req.body
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  await Analytics.findOneAndUpdate(
    { page, date },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  )

  res.status(200).json({ success: true, message: 'Tracked', data: null })
})

// GET /api/analytics/admin/dashboard-stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const Project = require('../models/Project')
  const FreelanceApplication = require('../models/FreelanceApplication')
  const ContactMessage = require('../models/ContactMessage')
  const Testimonial = require('../models/Testimonial')

  // Totals
  const [
    totalProjects,
    totalApplications,
    newApplications,
    unreadMessages,
    pendingTestimonials,
  ] = await Promise.all([
    Project.countDocuments({ status: 'published' }),
    FreelanceApplication.countDocuments(),
    FreelanceApplication.countDocuments({ status: 'new' }),
    ContactMessage.countDocuments({ isRead: false }),
    Testimonial.countDocuments({ approved: false }),
  ])

  // Applications by status
  const appsByStatus = await FreelanceApplication.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  // Last 30 days visitors
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const visitors = await Analytics.aggregate([
    { $match: { date: { $gte: thirtyDaysAgoStr } } },
    { $group: { _id: '$date', count: { $sum: '$count' } } },
    { $sort: { _id: 1 } },
  ])

  const totalVisitors = visitors.reduce((sum, v) => sum + v.count, 0)

  // Recent applications and messages
  const [recentApplications, recentMessages] = await Promise.all([
    FreelanceApplication.find().sort({ createdAt: -1 }).limit(5).select('clientName email projectType status createdAt isWaitlist'),
    ContactMessage.find().sort({ createdAt: -1 }).limit(5).select('name email subject isRead createdAt'),
  ])

  res.json({
    success: true,
    message: 'Dashboard stats fetched',
    data: {
      stats: {
        totalProjects,
        totalApplications,
        newApplications,
        unreadMessages,
        pendingTestimonials,
        totalVisitors,
      },
      appsByStatus,
      visitors,
      recentApplications,
      recentMessages,
    },
  })
})
