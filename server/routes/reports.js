import express from 'express';
import XLSX from 'xlsx';
import Report from '../models/Report.js';
import Counter from '../models/Counter.js';
import { protect } from '../middleware/auth.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { toSlug, uniqueSlug } from '../utils/slugUtils.js';

const router = express.Router();
router.use(protect);

const POPULATE = [
  { path: 'assignedTo',         select: 'username email' },
  { path: 'approvalAssignedTo', select: 'username email' },
  { path: 'createdBy',          select: 'username email' },
];

// Which fields each step is allowed to update
const STEP_FIELDS = {
  general:   ['projectName', 'assignedTo', 'actualProjectId', 'donationUrl', 'cost', 'projectLead', 'fiscalYear', 'region', 'sector', 'livesImpacted'],
  narrative: ['projectBackground', 'strategicResponse'],
  metrics:   ['children', 'women', 'men', 'deliverables'],
  media:     ['images', 'thumbnail', 'videoUrl', 'milestones'],
  location:  ['countries', 'locations'],
};


const ALL_STEPS = Object.keys(STEP_FIELDS);

// Helper — edit access: superadmin or assigned editor
const canEdit = (admin, report) =>
  admin.role === 'superadmin' ||
  report.assignedTo.some(a => String(a._id ?? a) === String(admin._id));

// Helper — view access: superadmin, assigned editor, or approval reviewer
const canView = (admin, report) =>
  canEdit(admin, report) ||
  (report.approvalAssignedTo && String(report.approvalAssignedTo._id ?? report.approvalAssignedTo) === String(admin._id));

// Helper — returns an error message if any assignee already appears on another
// report with the same project name (same project, same user = duplicate)
async function findProjectAssigneeConflicts(projectName, assigneeIds, excludeReportId = null) {
  const filter = {
    projectName: projectName.trim(),
    assignedTo:  { $in: assigneeIds },
  };
  if (excludeReportId) filter._id = { $ne: excludeReportId };

  const conflicts = await Report.find(filter)
    .select('assignedTo')
    .populate('assignedTo', 'username email');

  if (conflicts.length === 0) return null;

  const taken = new Set();
  for (const report of conflicts) {
    for (const a of report.assignedTo) {
      if (assigneeIds.includes(String(a._id))) {
        taken.add(a.username || a.email);
      }
    }
  }
  const names = [...taken].join(', ');
  return `${names} ${taken.size === 1 ? 'is' : 'are'} already assigned to "${projectName.trim()}"`;
}

// ── GET /api/reports/counts ──────────────────────────────────────────
// Must be before /:id to avoid 'counts' being treated as an id
router.get('/counts', async (req, res) => {
  try {
    const isSuperAdmin = req.admin.role === 'superadmin';

    // Base filter for regular statuses: reports assigned to me (as editor) or as approver
    const baseFilter = isSuperAdmin
      ? {}
      : { $or: [{ assignedTo: req.admin._id }, { approvalAssignedTo: req.admin._id }] };

    // For pending_approval: non-superadmin sees ONLY reports where they are the approver
    const approvalFilter = isSuperAdmin
      ? { status: 'pending_approval' }
      : { approvalAssignedTo: req.admin._id, status: 'pending_approval' };

    const REGULAR = ['pending', 'draft', 'published', 'trash'];

    const [regularResults, approvalCount] = await Promise.all([
      Promise.all(REGULAR.map(s => Report.countDocuments({ ...baseFilter, status: s }))),
      Report.countDocuments(approvalFilter),
    ]);

    const counts = Object.fromEntries(REGULAR.map((s, i) => [s, regularResults[i]]));
    counts.pending_approval = approvalCount;
    counts.all = regularResults.filter((_, i) => REGULAR[i] !== 'trash').reduce((a, b) => a + b, 0)
      + approvalCount;

    res.json({ counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/reports?status=&q=&sort=recent|oldest&page=&limit= ──────
router.get('/', async (req, res) => {
  try {
    const { status, q, sort } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
    const sortOrder =
      sort === 'oldest' ? 'createdAt' :
      sort === 'az'     ? 'projectName' :
      sort === 'za'     ? '-projectName' :
      '-createdAt';

    const isSuperAdmin = req.admin.role === 'superadmin';
    const VALID_STATUSES = ['pending', 'draft', 'published', 'pending_approval', 'trash'];

    let filter;
    if (!isSuperAdmin && status === 'pending_approval') {
      // Approval reviewer tab: only reports where this user is the assigned approver
      filter = { approvalAssignedTo: req.admin._id, status: 'pending_approval' };
    } else {
      filter = isSuperAdmin
        ? {}
        : { $or: [{ assignedTo: req.admin._id }, { approvalAssignedTo: req.admin._id }] };

      if (status && VALID_STATUSES.includes(status)) {
        filter.status = status;
      } else {
        // "All" tab excludes trash
        filter.status = { $ne: 'trash' };
      }
    }
    if (q?.trim()) {
      filter.projectName = new RegExp(q.trim(), 'i');
    }

    const [reports, total, agg] = await Promise.all([
      Report.find(filter).populate(POPULATE).sort(sortOrder).skip(skip).limit(limit),
      Report.countDocuments(filter),
      Report.aggregate([{ $match: filter }, { $group: { _id: null, lives: { $sum: '$livesImpacted' } } }]),
    ]);

    const totalLives = agg[0]?.lives ?? 0;
    res.json({
      reports,
      meta:  buildMeta({ page, limit, total }),
      stats: { totalLives, count: total },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/reports/search?q= ───────────────────────────────────────
// Must be before /:id to avoid 'search' being treated as an id
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim() || q.trim().length < 1) return res.json({ suggestions: [] });

    const docs = await Report.find({ projectName: new RegExp(q.trim(), 'i') })
      .select('projectName')
      .limit(10);

    const suggestions = [...new Set(docs.map(d => d.projectName))];
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/reports/export?format=csv|excel ─────────────────────────
// Must be before /:id to avoid 'export' being treated as an id
router.get('/export', async (req, res) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin only' });
  }
  try {
    const format = req.query.format === 'excel' ? 'excel' : 'csv';

    const reports = await Report.find({})
      .populate([
        { path: 'assignedTo', select: 'username email' },
        { path: 'createdBy',  select: 'username email' },
      ])
      .sort({ createdAt: -1 })
      .lean();

    const dateStr  = new Date().toISOString().split('T')[0];
    const toRows   = (r) => ({
      'Project ID':           r.projectId        ?? '',
      'Project Name':         r.projectName      ?? '',
      'Slug':                 r.slug             ?? '',
      'Status':               r.status           ?? '',
      'Project Lead':         r.projectLead      ?? '',
      'Fiscal Year':          r.fiscalYear       ?? '',
      'Region':               r.region           ?? '',
      'Sector':               r.sector           ?? '',
      'Lives Impacted':       r.livesImpacted    ?? 0,
      'Countries':            (r.countries  || []).join('; '),
      'Project Background':   r.projectBackground  ?? '',
      'Strategic Response':   r.strategicResponse  ?? '',
      'Children':             r.children ?? 0,
      'Women':                r.women    ?? 0,
      'Men':                  r.men      ?? 0,
      'Deliverables':         (r.deliverables || []).map(d => `${d.label}(${d.count})`).join('; '),
      'Images Count':         (r.images     || []).length,
      'Thumbnail URL':        r.thumbnail  ?? '',
      'Video URL':            r.videoUrl   ?? '',
      'Milestones Count':     (r.milestones || []).length,
      'Steps Completed':      (r.stepsCompleted || []).join('; '),
      'Assigned To':          (r.assignedTo || []).map(a => a.username).join('; '),
      'Created By':           r.createdBy?.username ?? '',
      'Created At':           r.createdAt ? new Date(r.createdAt).toISOString() : '',
      'Updated At':           r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
    });

    const rowObjects = reports.map(toRows);

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(rowObjects);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reports');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reports-export-${dateStr}.xlsx"`);
      return res.send(buf);
    }

    // CSV — escape fields that contain commas, quotes, or newlines
    const escape = (v) => {
      const s = v == null ? '' : String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const keys = Object.keys(rowObjects[0] ?? {});
    const csvRows = rowObjects.map(r => keys.map(k => escape(r[k])).join(','));
    const csv = [keys.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="reports-export-${dateStr}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

// ── POST /api/reports ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create reports' });
    }

    const { projectName, assignedTo, actualProjectId, approvalAssignedTo } = req.body;
    if (!projectName?.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: 'At least one assignee is required' });
    }

    // Reject duplicate user IDs within this report
    const uniqueAssignees = [...new Set(assignedTo.map(String))];
    if (uniqueAssignees.length !== assignedTo.length) {
      return res.status(400).json({ message: 'Duplicate assignees are not allowed' });
    }

    // Reject if any assignee is already on a report with the same project name
    const conflict = await findProjectAssigneeConflicts(projectName, uniqueAssignees);
    if (conflict) return res.status(400).json({ message: conflict });

    const seq  = await Counter.next('report');
    const slug = await uniqueSlug(Report, toSlug(projectName.trim()));

    const created = await Report.create({
      projectName:        projectName.trim(),
      slug,
      projectId:          `REP-${String(seq).padStart(3, '0')}`,
      actualProjectId:    (actualProjectId || '').trim(),
      assignedTo:         uniqueAssignees,
      createdBy:          req.admin._id,
      ...(approvalAssignedTo ? { approvalAssignedTo } : {}),
    });

    const report = await Report.findById(created._id).populate(POPULATE);
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/reports/:id ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(POPULATE);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!canView(req.admin, report)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Per-step backend validation — returns null (valid) or an error message string
function validateStepPayload(stepName, body, isSuperAdmin) {
  switch (stepName) {
    case 'general':
      if (isSuperAdmin) {
        if (!body.projectName?.trim())                      return 'Project name is required';
        if (!Array.isArray(body.assignedTo) || !body.assignedTo.length) return 'At least one assignee is required';
      }
      if (!body.projectLead?.trim())                        return 'Project lead is required';
      if (!body.fiscalYear)                                 return 'Fiscal year is required';
      if (!body.region?.trim())                             return 'Region is required';
      if (!body.sector?.trim())                             return 'Sector is required';
      if (!body.livesImpacted || Number(body.livesImpacted) <= 0) return 'Lives impacted must be greater than 0';
      break;
    case 'narrative':
      if (!body.projectBackground?.trim())  return 'Project background is required';
      if (!body.strategicResponse?.trim())  return 'Strategic response is required';
      break;
    case 'metrics': {
      const valid = (body.deliverables || []).filter(d => d.label?.trim() && Number(d.count) > 0);
      if (!valid.length) return 'Add at least one deliverable with a label and count';
      break;
    }
    case 'media': {
      const validImages = (body.images || []).filter(img => img.url?.trim());
      if (!validImages.length) return 'Add at least one image URL';
      if (validImages.length > 10) return 'Maximum 10 images allowed';
      const validMilestones = (body.milestones || []).filter(m => m.date?.trim() && m.title?.trim());
      if (!validMilestones.length) return 'Add at least one milestone with a date and title';
      break;
    }
    case 'location': {
      if (!body.countries?.length) return 'Select at least one country';
      const countriesWithLoc = new Set(
        (body.locations || []).filter(l => l.address?.trim()).map(l => l.country)
      );
      const missing = body.countries.filter(c => !countriesWithLoc.has(c));
      if (missing.length) return `Add at least one location for: ${missing.join(', ')}`;
      break;
    }
  }
  return null;
}

// ── PATCH /api/reports/:id/step/:stepName ────────────────────────────
router.patch('/:id/step/:stepName', async (req, res) => {
  try {
    if (req.admin.role === 'viewer') {
      return res.status(403).json({ message: 'Viewers have read-only access' });
    }

    const { stepName } = req.params;
    if (!STEP_FIELDS[stepName]) {
      return res.status(400).json({ message: `Invalid step: ${stepName}` });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!canEdit(req.admin, report)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (report.status === 'trash') {
      return res.status(400).json({ message: 'Cannot edit a trashed report. Restore it first.' });
    }
    if (report.status === 'pending_approval' && req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'This report is awaiting approval and cannot be edited.' });
    }

    const isSuperAdmin = req.admin.role === 'superadmin';

    // Block admin role from changing protected fields
    if (!isSuperAdmin && stepName === 'general') {
      if (req.body.projectName !== undefined) delete req.body.projectName;
      if (req.body.assignedTo  !== undefined) delete req.body.assignedTo;
    }

    // Per-step payload validation
    const validationError = validateStepPayload(stepName, req.body, isSuperAdmin);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Validate assignedTo uniqueness + conflict check (superadmin only)
    if (isSuperAdmin && stepName === 'general' && Array.isArray(req.body.assignedTo)) {
      const unique = [...new Set(req.body.assignedTo.map(String))];
      if (unique.length !== req.body.assignedTo.length) {
        return res.status(400).json({ message: 'Duplicate assignees are not allowed' });
      }
      const nameToCheck = (req.body.projectName ?? report.projectName).trim();
      const conflict    = await findProjectAssigneeConflicts(nameToCheck, unique, req.params.id);
      if (conflict) return res.status(400).json({ message: conflict });
      req.body.assignedTo = unique;
    }

    // Apply only the fields allowed for this step
    for (const field of STEP_FIELDS[stepName]) {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    }

    // Track completed step
    if (!report.stepsCompleted.includes(stepName)) {
      report.stepsCompleted.push(stepName);
    }

    // Status: pending_approval if all steps done and an approver is assigned; else published
    const allDone = ALL_STEPS.every(s => report.stepsCompleted.includes(s));
    if (allDone) {
      report.status = report.approvalAssignedTo ? 'pending_approval' : 'published';
    } else {
      report.status = 'draft';
    }

    await report.save();

    const populated = await Report.findById(report._id).populate(POPULATE);
    res.json({ report: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/reports/:id/restore ──────────────────────────────────
router.patch('/:id/restore', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can restore reports' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status !== 'trash') {
      return res.status(400).json({ message: 'Report is not in trash' });
    }
    const allDone = ALL_STEPS.every(s => report.stepsCompleted.includes(s));
    if (allDone) {
      report.status = report.approvalAssignedTo ? 'pending_approval' : 'published';
    } else {
      report.status = 'draft';
    }
    await report.save();
    res.json({ message: 'Report restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reports/:id/permanent ───────────────────────────────
router.delete('/:id/permanent', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can permanently delete reports' });
    }
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/reports/:id/approve ──────────────────────────────────
router.patch('/:id/approve', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const isAssignedApprover =
      report.approvalAssignedTo &&
      String(report.approvalAssignedTo) === String(req.admin._id);

    if (!isAssignedApprover && req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'You are not the approval reviewer for this report' });
    }
    if (report.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Report is not pending approval' });
    }

    report.status = 'published';
    await report.save();
    const populated = await Report.findById(report._id).populate(POPULATE);
    res.json({ report: populated, message: 'Report approved and published' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reports/:id ──────────────────────────────────────────
// Soft-delete: moves report to trash (status = 'trash')
router.delete('/:id', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can delete reports' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.status = 'trash';
    await report.save();
    res.json({ message: 'Report moved to trash' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
