const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) {
      console.error('❌  MONGO_URI is not set in .env')
      process.exit(1)
    }

    const isAtlas = uri.includes('mongodb+srv')
    const conn = await mongoose.connect(uri)

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
