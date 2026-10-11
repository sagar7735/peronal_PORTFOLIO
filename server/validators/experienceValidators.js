const { z } = require('zod')

exports.createExperienceSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  type: z.enum(['Full-time', 'Freelance', 'Internship', 'Part-time']),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().max(2000).optional(),
  achievements: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  order: z.number().int().min(0).optional(),
})

exports.updateExperienceSchema = exports.createExperienceSchema.partial()
exports.reorderSchema = z.array(z.object({ id: z.string(), order: z.number().int().min(0) }))
