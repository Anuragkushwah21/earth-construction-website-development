import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Outgoing mail over Gmail SMTP. `SMTP_PASS` must be a Google App Password —
 * a normal account password is rejected by Gmail for SMTP sign-in.
 *
 * Mail is optional: with nothing configured the app still runs, and callers
 * are told the message was not delivered rather than failing the request.
 */

const globalForMail = globalThis as unknown as { _mailTransporter?: Transporter }

export function isMailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter() {
  if (globalForMail._mailTransporter) return globalForMail._mailTransporter

  const port = Number(process.env.SMTP_PORT ?? 465)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  globalForMail._mailTransporter = transporter
  return transporter
}

function fromAddress() {
  const configured = process.env.SMTP_FROM?.trim()
  if (configured) return configured
  return `Earth Construction Company <${process.env.SMTP_USER}>`
}

export type MailResult = { delivered: boolean; reason?: 'not-configured' | 'send-failed' }

/**
 * Checks that the configured SMTP account can authenticate before callers
 * create an action that depends on delivery, such as a password-reset token.
 * No message is sent by this check.
 */
export async function verifyMailConnection(): Promise<MailResult> {
  if (!isMailConfigured()) return { delivered: false, reason: 'not-configured' }

  try {
    await getTransporter().verify()
    return { delivered: true }
  } catch (error) {
    console.error('[mail] SMTP authentication failed:', error)
    return { delivered: false, reason: 'send-failed' }
  }
}

export async function sendMail(message: {
  to: string
  subject: string
  text: string
  html: string
}): Promise<MailResult> {
  if (!isMailConfigured()) {
    // Without SMTP credentials there is nowhere to send. In development the
    // body is printed so the reset link is still reachable while testing.
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[mail] SMTP not configured — message for ${message.to} not sent:\n${message.text}`)
    } else {
      console.warn('[mail] SMTP not configured; skipping message to', message.to)
    }
    return { delivered: false, reason: 'not-configured' }
  }

  try {
    await getTransporter().sendMail({ from: fromAddress(), ...message })
    return { delivered: true }
  } catch (error) {
    // Never surface SMTP internals to the browser — the caller returns a
    // generic message and the detail stays in the server log.
    console.error('[mail] delivery failed:', error)
    return { delivered: false, reason: 'send-failed' }
  }
}

/** The reset email, in both plain text and a minimal branded HTML version. */
export function passwordResetEmail({ name, url, minutes }: { name: string; url: string; minutes: number }) {
  const greeting = name ? `Hello ${name},` : 'Hello,'
  const text = [
    greeting,
    '',
    'We received a request to reset the password for your Earth Construction Company admin account.',
    '',
    `Reset your password: ${url}`,
    '',
    `This link expires in ${minutes} minutes and can only be used once.`,
    'If you did not request this, you can ignore this email — your password stays unchanged.',
  ].join('\n')

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f1f0ed;font-family:Arial,Helvetica,sans-serif;color:#151817">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e1e0db">
    <tr><td style="padding:28px 28px 8px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#b87910">Earth Construction Company</p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25">Reset your password</h1>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 22px;font-size:14px;line-height:1.6">We received a request to reset the password for your admin account.</p>
      <p style="margin:0 0 22px">
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#151817;color:#ffffff;text-decoration:none;padding:13px 22px;font-size:12px;font-weight:bold;letter-spacing:.08em">RESET PASSWORD</a>
      </p>
      <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#5d655f">This link expires in ${minutes} minutes and can only be used once.</p>
      <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#5d655f">If you did not request this, you can ignore this email — your password stays unchanged.</p>
      <p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:#8a918b;word-break:break-all">If the button does not work, paste this link into your browser:<br>${escapeHtml(url)}</p>
    </td></tr>
  </table>
</body></html>`

  return { text, html }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
