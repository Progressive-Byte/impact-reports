import express from 'express';
import Report from '../models/Report.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

const POPULATE = [
  { path: 'assignedTo', select: 'username email' },
  { path: 'createdBy',  select: 'username email' },
];

// Which fields each step is allowed to update
const STEP_FIELDS = {
  general:   ['projectName', 'assignedTo', 'projectLead', 'fiscalYear', 'livesImpacted'],
  narrative: ['projectBackground', 'strategicResponse'],
  metrics:   ['children', 'women', 'men', 'deliverables'],
  media:     ['galleryUrl', 'milestones'],
};

const ALL_STEPS = Object.keys(STEP_FIELDS);

// Helper — check if caller can access a report
const canAccess = (admin, report) =>
  admin.role === 'superadmin' ||
  report.assignedTo.some(a => String(a._id ?? a) === String(admin._id));

// Helper — returns an error message if any assignee is already used in another report
async function findAssigneeConflicts(assigneeIds, excludeReportId = null) {
  const filter = { assignedTo: { $in: assigneeIds } };
  if (excludeReportId) filter._id = { $ne: excludeReportId };

  const conflicts = await Report.find(filter)
    .select('projectName assignedTo')
    .populate('assignedTo', 'username email');

  if (conflicts.length === 0) return null;

  const messages = [];
  for (const report of conflicts) {
    for (const a of report.assignedTo) {
      if (assigneeIds.includes(String(a._id))) {
        messages.push(`${a.username || a.email} is already assigned to "${report.projectName}"`);
      }
    }
  }
  return messages.join('; ');
}

// ── GET /api/reports?status= ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    const filter = req.admin.role === 'superadmin'
      ? {}
      : { assignedTo: req.admin._id };

    if (status && ['pending', 'draft', 'published'].includes(status)) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate(POPULATE)
      .sort('-createdAt');

    res.json({ reports });
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

// ── POST /api/reports ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create reports' });
    }

    const { projectName, assignedTo } = req.body;
    if (!projectName?.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: 'At least one assignee is required' });
    }

    // Remove duplicate admin IDs before storing
    const uniqueAssignees = [...new Set(assignedTo.map(String))];
    if (uniqueAssignees.length !== assignedTo.length) {
      return res.status(400).json({ message: 'Duplicate assignees are not allowed' });
    }

    const created = await Report.create({
      projectName: projectName.trim(),
      assignedTo:  uniqueAssignees,
      createdBy:   req.admin._id,
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
    if (!canAccess(req.admin, report)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/reports/:id/step/:stepName ────────────────────────────
router.patch('/:id/step/:stepName', async (req, res) => {
  try {
    const { stepName } = req.params;
    if (!STEP_FIELDS[stepName]) {
      return res.status(400).json({ message: `Invalid step: ${stepName}` });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!canAccess(req.admin, report)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate assignedTo for duplicates when general step is being saved
    if (stepName === 'general' && Array.isArray(req.body.assignedTo)) {
      const unique = [...new Set(req.body.assignedTo.map(String))];
      if (unique.length !== req.body.assignedTo.length) {
        return res.status(400).json({ message: 'Duplicate assignees are not allowed' });
      }
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

    // Status: published only when all 4 steps are done
    const allDone = ALL_STEPS.every(s => report.stepsCompleted.includes(s));
    report.status = allDone ? 'published' : 'draft';

    await report.save();

    const populated = await Report.findById(report._id).populate(POPULATE);
    res.json({ report: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reports/:id ──────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can delete reports' });
    }
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
