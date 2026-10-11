const { z } = require('zod')

exports.createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  shortDescription: z.string().min(1).max(500),
  fullDescription: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  category: z.enum(['Web', 'Mobile', 'Full Stack', 'Freelance']).default('Web'),
  liveUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  featured: z.boolean().optional().default(false),
  isClientProject: z.boolean().optional().default(false),
  clientName: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['published', 'draft']).default('draft'),
})

exports.updateProjectSchema = exports.createProjectSchema.partial()
exports.reorderSchema = z.array(z.object({ id: z.string(), order: z.number().int().min(0) }))
