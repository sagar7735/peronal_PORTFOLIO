const { z } = require('zod')

exports.updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  tagline: z.string().max(300).optional(),
  bio: z.string().max(2000).optional(),
  currentCompany: z.string().max(200).optional(),
  currentRole: z.string().max(200).optional(),
  yearsOfExperience: z.number().min(0).max(100).optional(),
  location: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  socialLinks: z.object({
    github: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
  }).optional(),
  availableForFreelance: z.boolean().optional(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
})
