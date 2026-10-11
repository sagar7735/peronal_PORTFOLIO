const { z } = require('zod')

exports.createSkillSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['Frontend', 'Backend', 'Mobile', 'Database', 'Tools']),
  level: z.number().int().min(0).max(100).default(80),
  icon: z.string().max(100).optional(),
  order: z.number().int().min(0).optional(),
})

exports.updateSkillSchema = exports.createSkillSchema.partial()

exports.reorderSchema = z.array(
  z.object({ id: z.string(), order: z.number().int().min(0) })
)
