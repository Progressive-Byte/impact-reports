import nodemailer from 'nodemailer';

async function sendMail({ to, subject, text, html }) {
  if (!process.env.SMTP_HOST) {
    return;
  }

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER;
  if (!from) {
    throw new Error('SMTP_FROM (or SMTP_USER) must be set in .env');
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(`[MAILER] Sending to ${to} via ${process.env.SMTP_HOST}`);
  await transport.sendMail({ from, to, subject, text, html });
  console.log(`[MAILER] ✓ Sent to ${to}`);
}

export async function sendResetOTPEmail({ to, code }) {
  await sendMail({
    to,
    subject: 'Your password reset code — Impact Reports',
    text: `Your password reset verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
        <div style="background:#0B0D0F;padding:24px 32px;display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:#E52321;border-radius:8px;display:flex;align-items:center;justify-content:center">
            <span style="color:#fff;font-weight:900;font-size:16px">⚡</span>
          </div>
          <span style="color:#fff;font-weight:900;font-size:16px;letter-spacing:-0.5px;text-transform:uppercase">Impact Report</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0B0D0F">Password Reset Code</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
            Use the code below to reset your password. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#0B0D0F;font-family:monospace">${code}</span>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendLoginOTPEmail({ to, code }) {
  await sendMail({
    to,
    subject: 'Your login verification code — Impact Reports',
    text: `Your two-factor authentication code is: ${code}\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
        <div style="background:#0B0D0F;padding:24px 32px;display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:#E52321;border-radius:8px;display:flex;align-items:center;justify-content:center">
            <span style="color:#fff;font-weight:900;font-size:16px">⚡</span>
          </div>
          <span style="color:#fff;font-weight:900;font-size:16px;letter-spacing:-0.5px;text-transform:uppercase">Impact Report</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0B0D0F">Login Verification Code</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
            Use the code below to complete your sign-in. It expires in <strong>5 minutes</strong>.
          </p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#0B0D0F;font-family:monospace">${code}</span>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px">
            If you did not attempt to sign in, your account may be at risk — change your password immediately.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendInviteEmail({ to, token }) {
  const appUrl = process.env.APP_URL || 'http://localhost:5174';
  const link   = `${appUrl}/alkabirimpact/register?token=${token}`;

  await sendMail({
    to,
    subject: 'You\'ve been invited — Impact Reports Admin Portal',
    text: `You have been invited to join the Impact Reports Admin Portal.\n\nComplete your registration here:\n${link}\n\nThis link expires in 48 hours.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
        <div style="background:#0B0D0F;padding:24px 32px;display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:#E52321;border-radius:8px;display:flex;align-items:center;justify-content:center">
            <span style="color:#fff;font-weight:900;font-size:16px">⚡</span>
          </div>
          <span style="color:#fff;font-weight:900;font-size:16px;letter-spacing:-0.5px;text-transform:uppercase">Impact Report</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0B0D0F">You're invited!</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
            You have been invited to join the <strong>Impact Reports Admin Portal</strong>.
            Click the button below to set up your account.
          </p>
          <a href="${link}"
             style="display:inline-block;background:#E52321;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:24px">
            Complete Registration →
          </a>
          <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px">
            This link expires in <strong>48 hours</strong>. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
