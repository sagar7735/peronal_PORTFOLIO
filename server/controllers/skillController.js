const Skill = require('../models/Skill')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { createSkillSchema, updateSkillSchema, reorderSchema } = require('../validators/skillValidators')

// GET /api/skills (public)
exports.getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find().sort({ category: 1, order: 1 })
  res.json({ success: true, message: 'Skills fetched', data: skills })
})

// POST /api/admin/skills
exports.createSkill = asyncHandler(async (req, res) => {
  const result = createSkillSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  const skill = await Skill.create(result.data)
  res.status(201).json({ success: true, message: 'Skill created', data: skill })
})

// PUT /api/admin/skills/:id
exports.updateSkill = asyncHandler(async (req, res) => {
  const result = updateSkillSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  const skill = await Skill.findByIdAndUpdate(req.params.id, result.data, { new: true, runValidators: true })
  if (!skill) throw new ApiError(404, 'Skill not found')
  res.json({ success: true, message: 'Skill updated', data: skill })
})

// DELETE /api/admin/skills/:id
exports.deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id)
  if (!skill) throw new ApiError(404, 'Skill not found')
  res.json({ success: true, message: 'Skill deleted', data: null })
})

// PATCH /api/admin/skills/reorder
exports.reorderSkills = asyncHandler(async (req, res) => {
  const result = reorderSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  await Promise.all(result.data.map(({ id, order }) => Skill.findByIdAndUpdate(id, { order })))
  res.json({ success: true, message: 'Skills reordered', data: null })
})
