const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Code' },
    features: [{ type: String }],
    startingPrice: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '7-14 days' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Service', serviceSchema)
