import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter, Instagram, Mail, Phone, MapPin, Code2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { profileApi } from '../services/publicApi'

export default function Footer() {
  const { data: profile } = useApi(profileApi.get)
  const year = new Date().getFullYear()

  const socials = [
    { icon: Github, href: profile?.socialLinks?.github, label: 'GitHub' },
    { icon: Linkedin, href: profile?.socialLinks?.linkedin, label: 'LinkedIn' },
    { icon: Twitter, href: profile?.socialLinks?.twitter, label: 'Twitter' },
    { icon: Instagram, href: profile?.socialLinks?.instagram, label: 'Instagram' },
  ].filter(s => s.href && s.href.trim() !== '')

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'Freelance', to: '/freelance' },
    { label: 'Contact', to: '/#contact' },
    { label: 'Leave a Review', to: '/testimonial' },
  ]

  return (
    <footer className="relative border-t border-white/10 backdrop-blur-xl bg-gray-950/80 dark:bg-gray-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-white text-lg">Sagar Kumar Jena</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Full Stack Developer at Excerpt Technologies Pvt Ltd. Building clean, performant web & mobile experiences.
            </p>
            {profile?.availableForFreelance && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-600/20 border border-green-500/30 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Available for Freelance
              </span>
            )}
            <div className="flex gap-3 pt-1">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <a href="mailto:jenasagar030@gmail.com" className="hover:text-white transition-colors">jenasagar030@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <a href="tel:+917735802848" className="hover:text-white transition-colors">+91 7735802848</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Bangalore, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">&copy; {year} Sagar Kumar Jena. All rights reserved.</p>
          <p className="text-gray-600 text-xs">Built with React, Node.js &amp; MongoDB</p>
        </div>
      </div>
    </footer>
  )
}
