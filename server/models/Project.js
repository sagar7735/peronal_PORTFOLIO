const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, trim: true },
    thumbnail: { type: String, default: '' },
    images: [{ type: String }],
    techStack: [{ type: String }],
    category: {
      type: String,
      enum: ['Web', 'Mobile', 'Full Stack', 'Freelance'],
      default: 'Web',
    },
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    isClientProject: { type: Boolean, default: false },
    clientName: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
  },
  { timestamps: true }
)

projectSchema.index({ status: 1, featured: 1 })

module.exports = mongoose.model('Project', projectSchema)
