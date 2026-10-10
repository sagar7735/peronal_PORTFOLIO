require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('../models/Admin')
const Profile = require('../models/Profile')
const Skill = require('../models/Skill')
const Experience = require('../models/Experience')
const Service = require('../models/Service')
const Project = require('../models/Project')

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) { console.error('❌  MONGO_URI not set'); process.exit(1) }
  const isAtlas = uri.includes('mongodb+srv')
  await mongoose.connect(uri)
  console.log(`✅  Connected to ${isAtlas ? 'Atlas' : 'Local'} MongoDB`)
}

async function seedAdmin() {
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL })
  if (existing) {
    console.log('ℹ️   Admin already exists, skipping.')
    return
  }
  await Admin.create({
    name: 'Sagar Kumar Jena',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  })
  console.log('✅  Admin created:', process.env.ADMIN_EMAIL)
}

async function seedProfile() {
  const existing = await Profile.findOne()
  if (existing) {
    console.log('ℹ️   Profile already exists, skipping.')
    return
  }
  await Profile.create({
    name: 'Sagar Kumar Jena',
    title: 'Full Stack Developer',
    tagline: 'Building modern web & mobile experiences — fast, clean, and production-ready.',
    bio: `I'm a Full Stack Developer at Excerpt Technologies Pvt Ltd, passionate about building scalable web and mobile applications. I work across the entire stack — from crafting responsive React UIs to designing robust Node.js APIs. I also take on freelance projects ranging from landing pages to full-stack SaaS applications.`,
    currentCompany: 'Excerpt Technologies Pvt Ltd',
    currentRole: 'Full Stack Developer',
    yearsOfExperience: 2,
    location: 'Bangalore, India',
    email: 'jenasagar030@gmail.com',
    phone: '7735802848',
    whatsapp: '7735802848',
    socialLinks: {
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      twitter: '',
      instagram: '',
    },
    availableForFreelance: true,
    stats: [
      { label: 'Years of Experience', value: '2+' },
      { label: 'Projects Completed', value: '20+' },
      { label: 'Happy Clients', value: '15+' },
      { label: 'Technologies', value: '11+' },
    ],
  })
  console.log('✅  Profile created')
}

async function seedSkills() {
  const count = await Skill.countDocuments()
  if (count > 0) {
    console.log('ℹ️   Skills already exist, skipping.')
    return
  }
  const skills = [
    { name: 'HTML', category: 'Frontend', level: 95, order: 1 },
    { name: 'CSS', category: 'Frontend', level: 90, order: 2 },
    { name: 'JavaScript', category: 'Frontend', level: 90, order: 3 },
    { name: 'React.js', category: 'Frontend', level: 88, order: 4 },
    { name: 'Next.js', category: 'Frontend', level: 80, order: 5 },
    { name: 'Tailwind CSS', category: 'Frontend', level: 92, order: 6 },
    { name: 'Node.js', category: 'Backend', level: 85, order: 1 },
    { name: 'Express.js', category: 'Backend', level: 85, order: 2 },
    { name: 'React Native', category: 'Mobile', level: 78, order: 1 },
    { name: 'Android Development', category: 'Mobile', level: 70, order: 2 },
    { name: 'MongoDB', category: 'Database', level: 82, order: 1 },
  ]
  await Skill.insertMany(skills)
  console.log(`✅  ${skills.length} skills created`)
}

async function seedExperience() {
  const count = await Experience.countDocuments()
  if (count > 0) {
    console.log('ℹ️   Experience already exists, skipping.')
    return
  }
  await Experience.insertMany([
    {
      company: 'Excerpt Technologies Pvt Ltd',
      role: 'Full Stack Developer',
      type: 'Full-time',
      startDate: new Date('2023-06-01'),
      isCurrent: true,
      description: 'Building and maintaining full-stack web applications for clients across various industries. Working with React, Node.js, Express, and MongoDB in an agile environment.',
      achievements: [
        'Delivered 10+ client projects end-to-end',
        'Improved API response times by 40% through query optimization',
        'Introduced component-based architecture reducing code duplication by 30%',
      ],
      techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      order: 1,
    },
    {
      company: 'Freelance',
      role: 'Freelance Full Stack Developer',
      type: 'Freelance',
      startDate: new Date('2022-01-01'),
      isCurrent: true,
      description: 'Designing and developing websites, web apps, and mobile applications for clients. Specialise in MERN stack and React Native projects.',
      achievements: [
        'Completed 15+ freelance projects',
        'Maintained 5-star rating across all platforms',
        'Delivered projects on time with full client satisfaction',
      ],
      techStack: ['React.js', 'React Native', 'Next.js', 'Node.js', 'MongoDB'],
      order: 2,
    },
  ])
  console.log('✅  Experience created')
}

async function seedServices() {
  const count = await Service.countDocuments()
  if (count > 0) {
    console.log('ℹ️   Services already exist, skipping.')
    return
  }
  await Service.insertMany([
    {
      title: 'Website Development',
      description: 'Professional, responsive websites built with modern technologies. From landing pages to full corporate websites.',
      icon: 'Globe',
      features: [
        'Responsive & mobile-first design',
        'SEO-optimized structure',
        'Fast loading performance',
        'Content Management System',
        'Contact & enquiry forms',
        '1 month post-launch support',
      ],
      startingPrice: 15000,
      deliveryTime: '7-14 days',
      order: 1,
      active: true,
    },
    {
      title: 'Web Application Development',
      description: 'Full-stack MERN web applications with admin panels, authentication, APIs, and real-world business logic.',
      icon: 'Code2',
      features: [
        'React frontend + Node.js backend',
        'MongoDB database with Mongoose',
        'JWT authentication & role-based access',
        'REST API design',
        'Admin dashboard',
        '3 months post-launch support',
      ],
      startingPrice: 35000,
      deliveryTime: '21-45 days',
      order: 2,
      active: true,
    },
    {
      title: 'Mobile App Development',
      description: 'Cross-platform mobile apps using React Native for both Android and iOS from a single codebase.',
      icon: 'Smartphone',
      features: [
        'iOS & Android from one codebase',
        'Native-feel UI components',
        'API integration',
        'Push notifications',
        'App Store & Play Store submission',
        '2 months post-launch support',
      ],
      startingPrice: 50000,
      deliveryTime: '30-60 days',
      order: 3,
      active: true,
    },
  ])
  console.log('✅  Services created')
}

async function seedProjects() {
  const count = await Project.countDocuments()
  if (count > 0) {
    console.log('ℹ️   Projects already exist, skipping.')
    return
  }
  await Project.insertMany([
    {
      title: 'E-Commerce Platform',
      slug: 'e-commerce-platform',
      shortDescription: 'A full-stack e-commerce platform with product management, cart, payments, and admin dashboard.',
      fullDescription: 'Built a complete e-commerce solution with React frontend, Node.js/Express backend, and MongoDB. Features include product listings, search & filters, shopping cart, order management, and a full admin dashboard for inventory and sales analytics.',
      techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Stripe'],
      category: 'Full Stack',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/',
      featured: true,
      status: 'published',
      order: 1,
    },
    {
      title: 'Task Management App',
      slug: 'task-management-app',
      shortDescription: 'A collaborative task management web app with real-time updates, boards, and team features.',
      fullDescription: 'Developed a Kanban-style task management application with drag-and-drop boards, task assignments, due dates, and team collaboration. Built with React, Node.js, and MongoDB.',
      techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io'],
      category: 'Web',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/',
      featured: true,
      status: 'published',
      order: 2,
    },
    {
      title: 'Fitness Tracker Mobile App',
      slug: 'fitness-tracker-mobile-app',
      shortDescription: 'A cross-platform React Native app for tracking workouts, nutrition, and personal fitness goals.',
      fullDescription: 'Built a feature-rich fitness tracking mobile app using React Native. Users can log workouts, track calorie intake, view progress charts, and set personal goals. Includes a Node.js/Express backend with MongoDB.',
      techStack: ['React Native', 'Node.js', 'Express.js', 'MongoDB', 'Expo'],
      category: 'Mobile',
      liveUrl: '',
      githubUrl: 'https://github.com/',
      featured: true,
      status: 'published',
      order: 3,
    },
  ])
  console.log('✅  Projects created')
}

async function main() {
  try {
    await connectDB()
    await seedAdmin()
    await seedProfile()
    await seedSkills()
    await seedExperience()
    await seedServices()
    await seedProjects()
    console.log('\n🎉  Database seeded successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌  Seed error:', err.message)
    process.exit(1)
  }
}

main()
