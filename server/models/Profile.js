const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    bio: { type: String, trim: true },
    avatar: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    currentCompany: { type: String, default: 'Excerpt Technologies Pvt Ltd' },
    currentRole: { type: String, default: 'Full Stack Developer' },
    yearsOfExperience: { type: Number, default: 1 },
    location: { type: String, default: 'Bangalore, India' },
    email: { type: String, required: true },
    phone: { type: String },
    whatsapp: { type: String },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    availableForFreelance: { type: Boolean, default: true },
    stats: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Profile', profileSchema)
