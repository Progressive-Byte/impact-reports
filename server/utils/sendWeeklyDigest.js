import Admin from '../models/Admin.js';
import Report from '../models/Report.js';
import PlatformSettings from '../models/PlatformSettings.js';
import nodemailer from 'nodemailer';

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    console.log(`[WEEKLY DIGEST] No SMTP configured — would have sent to: ${to}`);
    return;
  }
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER;
  const transport = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({ from, to, subject, html });
  console.log(`[WEEKLY DIGEST] ✓ Sent to ${to}`);
}

function buildHtml({ reports, weekStart, weekEnd }) {
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const totalLives = reports.reduce((sum, r) => sum + (r.livesImpacted || 0), 0);

  const regionCounts = reports.reduce((acc, r) => {
    acc[r.region] = (acc[r.region] || 0) + 1;
    return acc;
  }, {});

  const reportRows = reports.map(r => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#1f1f22;font-weight:600">${r.projectName}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280">${r.region || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:right">${(r.livesImpacted || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const regionSummary = Object.entries(regionCounts)
    .map(([region, count]) => `<span style="display:inline-block;margin:3px 4px 3px 0;padding:3px 10px;background:#f3f4f6;border-radius:20px;font-size:12px;color:#374151;font-weight:600">${region}: ${count}</span>`)
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">

      <!-- Header -->
      <div style="background:#0B0D0F;padding:24px 32px;display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:#E52321;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="color:#fff;font-weight:900;font-size:16px">⚡</span>
        </div>
        <div>
          <div style="color:#fff;font-weight:900;font-size:15px;letter-spacing:-0.3px;text-transform:uppercase">Impact Report</div>
          <div style="color:#9ca3af;font-size:11px;margin-top:1px">Weekly Digest</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:32px">
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#0B0D0F">Weekly Summary</h2>
        <p style="margin:0 0 24px;color:#9ca3af;font-size:13px">${fmt(weekStart)} – ${fmt(weekEnd)}</p>

        <!-- Stats strip -->
        <div style="display:flex;gap:12px;margin-bottom:28px">
          <div style="flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center">
            <div style="font-size:26px;font-weight:900;color:#E52321">${reports.length}</div>
            <div style="font-size:11px;color:#6b7280;font-weight:600;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em">Reports Published</div>
          </div>
          <div style="flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center">
            <div style="font-size:26px;font-weight:900;color:#E52321">${totalLives.toLocaleString()}</div>
            <div style="font-size:11px;color:#6b7280;font-weight:600;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em">Lives Impacted</div>
          </div>
        </div>

        ${reports.length === 0 ? `
          <div style="text-align:center;padding:32px 0;color:#9ca3af;font-size:14px">
            No reports were published this week.
          </div>
        ` : `
          <!-- Region tags -->
          <div style="margin-bottom:20px">
            <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Regions</div>
            ${regionSummary}
          </div>

          <!-- Reports table -->
          <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Published Reports</div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em">Project Name</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em">Region</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em">Lives Impacted</th>
              </tr>
            </thead>
            <tbody>${reportRows}</tbody>
          </table>
        `}
      </div>

      <!-- Footer -->
      <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
        <p style="margin:0;color:#9ca3af;font-size:11px">
          This digest is sent every Monday to superadmin accounts.<br>
          To stop receiving it, turn off <strong>Weekly digest</strong> in Settings.
        </p>
      </div>
    </div>
  `;
}

export async function sendWeeklyDigest() {
  try {
    // Check setting is still on before doing any work
    const settings = await PlatformSettings.findOne({ key: 'platform' }).lean();
    if (!settings?.weeklyDigest) {
      console.log('[WEEKLY DIGEST] Skipped — setting is off');
      return;
    }

    // Last 7 days window
    const weekEnd   = new Date();
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    // Reports published in the window
    const reports = await Report.find({
      status:    'published',
      updatedAt: { $gte: weekStart, $lte: weekEnd },
    })
      .select('projectName region livesImpacted updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    // Active superadmins only
    const superadmins = await Admin.find({ role: 'superadmin', isActive: true })
      .select('email username')
      .lean();

    if (superadmins.length === 0) {
      console.log('[WEEKLY DIGEST] No active superadmins found — skipping');
      return;
    }

    const html    = buildHtml({ reports, weekStart, weekEnd });
    const subject = `Weekly Digest — ${reports.length} report${reports.length === 1 ? '' : 's'} published this week`;

    for (const admin of superadmins) {
      await sendMail({ to: admin.email, subject, html });
    }

    console.log(`[WEEKLY DIGEST] Sent to ${superadmins.length} superadmin(s), ${reports.length} report(s) included`);
  } catch (err) {
    console.error('[WEEKLY DIGEST] Failed:', err.message);
  }
}
