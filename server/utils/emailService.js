const nodemailer = require('nodemailer')

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function baseTemplate(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f0f1e;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1e;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#7C3AED 0%,#2563EB 50%,#06B6D4 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Sagar Kumar Jena</h1>
<p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Full Stack Developer · Freelancer</p>
</td></tr>
<tr><td style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-top:0;border-radius:0 0 16px 16px;padding:36px 40px;">
${content}
</td></tr>
<tr><td style="padding:24px 0 0;text-align:center;">
<p style="margin:0;color:#6b7280;font-size:12px;">&copy; ${new Date().getFullYear()} Sagar Kumar Jena &nbsp;|&nbsp; <a href="mailto:jenasagar030@gmail.com" style="color:#7C3AED;text-decoration:none;">jenasagar030@gmail.com</a> &nbsp;|&nbsp; <a href="${process.env.CLIENT_URL||'#'}" style="color:#7C3AED;text-decoration:none;">Portfolio</a></p>
<p style="margin:6px 0 0;color:#4b5563;font-size:11px;">Bangalore, India &nbsp;·&nbsp; +91 7735802848</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

async function sendEmail({ to, subject, html }) {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Sagar Kumar Jena" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`📧  Email sent to ${to}: "${subject}"`)
  } catch (err) {
    console.error(`❌  Email failed to ${to}:`, err.message)
    // Non-blocking — swallow error, DB record already saved
  }
}

// 1. Notify admin of new freelance application
function notifyAdminNewApplication(application) {
  const { clientName, email, phone, company, projectType, budgetRange, timeline, description, isWaitlist } = application
  const adminUrl = `${process.env.CLIENT_URL||'#'}/admin/freelance`
  const content = `
<h2 style="margin:0 0 4px;color:#fff;font-size:20px;">${isWaitlist ? '⏳ New Waitlist Entry' : '🚀 New Project Request'}</h2>
<p style="margin:0 0 24px;color:#9ca3af;font-size:14px;">${isWaitlist ? 'Added to waitlist — you are currently marked as unavailable.' : 'Someone wants to work with you!'}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Name</span><span style="color:#f3f4f6;font-size:13px;font-weight:600;">${clientName}</span></td></tr>
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Email</span><a href="mailto:${email}" style="color:#7C3AED;font-size:13px;">${email}</a></td></tr>
${phone ? `<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Phone</span><span style="color:#f3f4f6;font-size:13px;">${phone}</span></td></tr>` : ''}
${company ? `<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Company</span><span style="color:#f3f4f6;font-size:13px;">${company}</span></td></tr>` : ''}
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Project Type</span><span style="color:#f3f4f6;font-size:13px;">${projectType}</span></td></tr>
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Budget</span><span style="color:#06B6D4;font-size:13px;font-weight:600;">${budgetRange}</span></td></tr>
${timeline ? `<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:140px;">Timeline</span><span style="color:#f3f4f6;font-size:13px;">${timeline}</span></td></tr>` : ''}
</table>
<p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 24px;"><strong style="color:#fff;">Description:</strong><br/>${description}</p>
<div style="text-align:center;"><a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#2563EB);color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;">View in Admin Panel →</a></div>`
  sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `${isWaitlist ? '[Waitlist]' : '[New Project]'} ${projectType} from ${clientName}`,
    html: baseTemplate(isWaitlist ? 'New Waitlist Entry' : 'New Project Request', content),
  })
}

// 2. Auto-reply to freelance applicant
function autoReplyApplicant(application) {
  const { clientName, email, isWaitlist } = application
  const content = isWaitlist
    ? `<h2 style="margin:0 0 16px;color:#fff;font-size:20px;">Hi ${clientName}, you're on the waitlist!</h2>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Thank you for reaching out! I'm currently fully booked and not taking on new projects right now.</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">I've added you to my waitlist and will contact you personally as soon as I have availability. I appreciate your patience!</p>
<p style="color:#9ca3af;font-size:14px;">In the meantime, check out my portfolio at <a href="${process.env.CLIENT_URL||'#'}" style="color:#7C3AED;">${process.env.CLIENT_URL||'my website'}</a>.</p>`
    : `<h2 style="margin:0 0 16px;color:#fff;font-size:20px;">Hi ${clientName}, I got your project request!</h2>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Thank you for considering me for your project. I've received your request and will review the details carefully.</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">I'll get back to you within <strong style="color:#fff;">24–48 hours</strong> to discuss next steps, timeline, and pricing.</p>
<div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:16px 20px;margin:0 0 20px;">
<p style="color:#c4b5fd;font-size:14px;margin:0;">📱 You can also reach me directly:<br/>WhatsApp: <a href="https://wa.me/917735802848" style="color:#7C3AED;">+91 7735802848</a><br/>Email: <a href="mailto:jenasagar030@gmail.com" style="color:#7C3AED;">jenasagar030@gmail.com</a></p>
</div>`
  sendEmail({
    to: email,
    subject: isWaitlist ? "You're on the waitlist — Sagar Kumar Jena" : 'Got your project request! — Sagar Kumar Jena',
    html: baseTemplate('Project Request Received', content),
  })
}

// 3. Notify admin of new contact message
function notifyAdminNewMessage(contactMsg) {
  const { name, email, subject, message: msgBody } = contactMsg
  const content = `
<h2 style="margin:0 0 4px;color:#fff;font-size:20px;">📬 New Contact Message</h2>
<p style="margin:0 0 24px;color:#9ca3af;font-size:14px;">Someone sent you a message via your portfolio.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:120px;">From</span><span style="color:#f3f4f6;font-size:13px;font-weight:600;">${name}</span></td></tr>
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:120px;">Email</span><a href="mailto:${email}" style="color:#7C3AED;font-size:13px;">${email}</a></td></tr>
<tr><td style="padding:6px 0;"><span style="color:#9ca3af;font-size:13px;display:inline-block;width:120px;">Subject</span><span style="color:#f3f4f6;font-size:13px;">${subject}</span></td></tr>
</table>
<p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 24px;"><strong style="color:#fff;">Message:</strong><br/>${msgBody}</p>
<div style="text-align:center;"><a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#2563EB);color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;">Reply to ${name} →</a></div>`
  sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Portfolio Contact] ${subject} — from ${name}`,
    html: baseTemplate('New Contact Message', content),
  })
}

// 4. Auto-reply to contact form sender
function autoReplyContact(contactMsg) {
  const { name, email, subject } = contactMsg
  const content = `
<h2 style="margin:0 0 16px;color:#fff;font-size:20px;">Hi ${name}, message received!</h2>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Thanks for getting in touch! I've received your message about <strong style="color:#fff;">"${subject}"</strong> and will get back to you as soon as possible.</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">I typically respond within 24 hours. If it's urgent, WhatsApp me at <a href="https://wa.me/917735802848" style="color:#7C3AED;">+91 7735802848</a>.</p>
<p style="color:#9ca3af;font-size:14px;margin:0;">— Sagar Kumar Jena</p>`
  sendEmail({
    to: email,
    subject: `Re: ${subject} — Sagar Kumar Jena`,
    html: baseTemplate('Message Received', content),
  })
}

// 5. Status update email to applicant (admin-triggered)
const STATUS_TEMPLATES = {
  accepted: {
    subject: '🎉 Your project has been accepted! — Sagar Kumar Jena',
    heading: 'Great news — your project is accepted!',
    body: (name) => `<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Hi ${name}, I'm excited to work on your project! I've reviewed your request and I'm ready to get started.</p><p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0;">I'll reach out shortly to discuss the project plan, milestones, and next steps. Stay tuned!</p>`,
  },
  rejected: {
    subject: 'Regarding your project request — Sagar Kumar Jena',
    heading: 'Thank you for your interest',
    body: (name) => `<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Hi ${name}, thank you for considering me for your project.</p><p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">After careful review, I'm unable to take on this particular project at this time. This could be due to current workload, project scope, or specialisation fit.</p><p style="color:#9ca3af;font-size:14px;margin:0;">I wish you the best of luck. Feel free to reach out again in the future!</p>`,
  },
  'in-progress': {
    subject: '🚀 Your project is in progress — Sagar Kumar Jena',
    heading: "We're building your project!",
    body: (name) => `<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Hi ${name}, just a quick update — I've started working on your project and things are moving along well!</p><p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0;">I'll keep you updated on progress. Feel free to reach out anytime if you have questions or new ideas.</p>`,
  },
  completed: {
    subject: '✅ Your project is complete — Sagar Kumar Jena',
    heading: 'Project completed! 🎉',
    body: (name) => `<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Hi ${name}, great news — your project is complete and ready for your review!</p><p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Please review the deliverables and let me know if you'd like any adjustments. I'm available for post-launch support as discussed.</p><p style="color:#9ca3af;font-size:14px;margin:0;">It was a pleasure working with you. I'd love a review if you're happy with the result! 😊</p>`,
  },
  reviewing: {
    subject: 'Your project is under review — Sagar Kumar Jena',
    heading: 'Reviewing your project request',
    body: (name) => `<p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 20px;">Hi ${name}, I'm currently reviewing the details of your project request.</p><p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0;">I'll get back to you soon with my decision and next steps. Thank you for your patience!</p>`,
  },
}

function sendStatusEmail(application, status) {
  const template = STATUS_TEMPLATES[status]
  if (!template) return
  const { clientName, email } = application
  const content = `
<h2 style="margin:0 0 16px;color:#fff;font-size:20px;">${template.heading}</h2>
${template.body(clientName)}
<div style="margin-top:24px;text-align:center;"><a href="${process.env.CLIENT_URL||'#'}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#2563EB);color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;">Visit Portfolio →</a></div>`
  sendEmail({ to: email, subject: template.subject, html: baseTemplate(template.heading, content) })
}

module.exports = { notifyAdminNewApplication, autoReplyApplicant, notifyAdminNewMessage, autoReplyContact, sendStatusEmail }
