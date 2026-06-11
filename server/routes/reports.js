import express from 'express';
import Report from '../models/Report.js';
import { protect } from '../middleware/auth.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { deriveRegion } from '../utils/regionUtils.js';

const router = express.Router();
router.use(protect);

const POPULATE = [
  { path: 'assignedTo', select: 'username email' },
  { path: 'createdBy',  select: 'username email' },
];

// Which fields each step is allowed to update
const STEP_FIELDS = {
  general:   ['projectName', 'assignedTo', 'projectLead', 'fiscalYear', 'sector', 'livesImpacted'],
  narrative: ['projectBackground', 'strategicResponse'],
  metrics:   ['children', 'women', 'men', 'deliverables'],
  media:     ['images', 'videoUrl', 'milestones'],
  location:  ['countries', 'locations'],
};

// Country → region mapping for auto-derivation on the location step
const COUNTRY_REGION = {
  // South Asia
  Afghanistan: 'South Asia', Bangladesh: 'South Asia', Bhutan: 'South Asia',
  India: 'South Asia', Maldives: 'South Asia', Nepal: 'South Asia',
  Pakistan: 'South Asia', 'Sri Lanka': 'South Asia',
  // Middle East
  Egypt: 'Middle East', Iran: 'Middle East', Iraq: 'Middle East',
  Jordan: 'Middle East', Kuwait: 'Middle East', Lebanon: 'Middle East',
  Libya: 'Middle East', Oman: 'Middle East', Palestine: 'Middle East',
  Qatar: 'Middle East', 'Saudi Arabia': 'Middle East', Syria: 'Middle East',
  Turkey: 'Middle East', 'United Arab Emirates': 'Middle East',
  Yemen: 'Middle East', Sudan: 'Middle East', Gaza: 'Middle East',
  'West Bank': 'Middle East', Morocco: 'Middle East', Tunisia: 'Middle East',
  // Africa
  Algeria: 'Africa', Angola: 'Africa', Cameroon: 'Africa', Chad: 'Africa',
  'Democratic Republic of the Congo': 'Africa', Djibouti: 'Africa',
  Ethiopia: 'Africa', Ghana: 'Africa', Guinea: 'Africa', Kenya: 'Africa',
  Madagascar: 'Africa', Malawi: 'Africa', Mali: 'Africa', Mauritania: 'Africa',
  Mozambique: 'Africa', Niger: 'Africa', Nigeria: 'Africa', Rwanda: 'Africa',
  Senegal: 'Africa', 'Sierra Leone': 'Africa', Somalia: 'Africa',
  'South Sudan': 'Africa', Tanzania: 'Africa', Uganda: 'Africa',
  Zambia: 'Africa', Zimbabwe: 'Africa', 'Burkina Faso': 'Africa',
  'Central African Republic': 'Africa', Congo: 'Africa', Eritrea: 'Africa',
  // Southeast Asia
  Cambodia: 'Southeast Asia', Indonesia: 'Southeast Asia', Laos: 'Southeast Asia',
  Malaysia: 'Southeast Asia', Myanmar: 'Southeast Asia', Philippines: 'Southeast Asia',
  Thailand: 'Southeast Asia', 'Timor-Leste': 'Southeast Asia', Vietnam: 'Southeast Asia',
};

function deriveRegion(countries) {
  if (!countries?.length) return 'Global';
  const regions = [...new Set(countries.map(c => COUNTRY_REGION[c] || 'Global'))];
  return regions.length === 1 ? regions[0] : 'Global';
}

const ALL_STEPS = Object.keys(STEP_FIELDS);

// Helper — check if caller can access a report
const canAccess = (admin, report) =>
  admin.role === 'superadmin' ||
  report.assignedTo.some(a => String(a._id ?? a) === String(admin._id));

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

// ── GET /api/reports?status=&q=&sort=recent|oldest&page=&limit= ──────
router.get('/', async (req, res) => {
  try {
    const { status, q, sort } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
    const sortOrder = sort === 'oldest' ? 'createdAt' : '-createdAt';

    const filter = req.admin.role === 'superadmin'
      ? {}
      : { assignedTo: req.admin._id };

    if (status && ['pending', 'draft', 'published'].includes(status)) {
      filter.status = status;
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

    // Reject duplicate user IDs within this report
    const uniqueAssignees = [...new Set(assignedTo.map(String))];
    if (uniqueAssignees.length !== assignedTo.length) {
      return res.status(400).json({ message: 'Duplicate assignees are not allowed' });
    }

    // Reject if any assignee is already on a report with the same project name
    const conflict = await findProjectAssigneeConflicts(projectName, uniqueAssignees);
    if (conflict) return res.status(400).json({ message: conflict });

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
    const { stepName } = req.params;
    if (!STEP_FIELDS[stepName]) {
      return res.status(400).json({ message: `Invalid step: ${stepName}` });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!canAccess(req.admin, report)) {
      return res.status(403).json({ message: 'Access denied' });
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

    // Auto-derive region from selected countries on the location step
    if (stepName === 'location' && report.countries.length) {
      report.region = deriveRegion(report.countries);
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
