const { z } = require('zod')

exports.createServiceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  icon: z.string().max(100).optional(),
  features: z.array(z.string()).optional(),
  startingPrice: z.number().min(0).optional(),
  deliveryTime: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional().default(true),
})

exports.updateServiceSchema = exports.createServiceSchema.partial()
exports.reorderSchema = z.array(z.object({ id: z.string(), order: z.number().int().min(0) }))
