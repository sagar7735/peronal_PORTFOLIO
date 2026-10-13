const mongoose = require('mongoose')
const dns = require('dns')

// Fix for Windows DNS: some Windows DNS servers refuse SRV record queries
// which mongodb+srv:// requires. Override with Google public DNS (8.8.8.8).
// This only affects DNS resolution inside this Node.js process.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
dns.setDefaultResultOrder('ipv4first')

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) {
      console.error('❌  MONGO_URI is not set in .env')
      process.exit(1)
    }

    const isAtlas = uri.includes('mongodb+srv')

    const options = {}
    if (isAtlas) {
      // Required for stable Atlas connections
      options.serverSelectionTimeoutMS = 10000
      options.socketTimeoutMS = 45000
    }

    const conn = await mongoose.connect(uri, options)

    const host = conn.connection.host
    if (isAtlas) {
      console.log(`✅  MongoDB Atlas connected: ${host}`)
    } else {
      console.log(`✅  MongoDB Local connected: ${host}`)
    }
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
