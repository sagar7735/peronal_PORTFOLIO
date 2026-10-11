const { z } = require('zod')

exports.freelanceApplicationSchema = z.object({
  clientName: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  projectType: z.enum(['Website', 'Web App', 'Mobile App', 'E-commerce', 'UI Redesign', 'Other']),
  budgetRange: z.string().min(1, 'Budget is required'),
  timeline: z.string().optional(),
  description: z.string().min(10, 'Please describe your project').max(5000),
  referenceLinks: z.array(z.string().url()).optional().default([]),
  preferredContact: z.enum(['Email', 'Phone', 'WhatsApp']).default('Email'),
  website: z.string().optional(), // honeypot
})

exports.contactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required').max(300),
  message: z.string().min(10, 'Message too short').max(5000),
  website: z.string().optional(), // honeypot
})

exports.testimonialSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientRole: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  message: z.string().min(10).max(2000),
  website: z.string().optional(), // honeypot
})
