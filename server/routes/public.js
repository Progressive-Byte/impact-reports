import express from 'express';
import Report from '../models/Report.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { deriveRegion } from '../utils/regionUtils.js';

const router = express.Router();

// "FY25" → "2025", "FY2025" → "2025"
function deriveYear(fiscalYear) {
  const match = (fiscalYear || '').match(/(\d+)/);
  if (!match) return '';
  const n = parseInt(match[1], 10);
  return n < 100 ? `20${String(n).padStart(2, '0')}` : String(n);
}

// "2025" → "FY25"
function yearToFiscal(year) {
  return `FY${String(year).slice(-2)}`;
}

function shapeCard(r) {
  const bg     = r.projectBackground || '';
  const region = r.region || deriveRegion(r.countries);
  return {
    id:        r._id.toString(),
    slug:      r.slug      || r._id.toString(),
    projectId: r.projectId || '',
    title:     r.projectName,
    image:     r.thumbnail || r.images?.[0]?.url || '',
    region,
    sector:    r.sector   || '',
    year:      deriveYear(r.fiscalYear),
    summary:   bg.length > 200 ? bg.slice(0, 200).trimEnd() + '…' : bg,
    countries: r.countries || [],
    metrics: {
      beneficiaries: r.livesImpacted || 0,
      locations:     r.locations?.length || r.countries?.length || 0,
    },
  };
}

// ── GET /api/public/reports ──────────────────────────────────────────
// Query: q, region (multi), sector (multi), country (multi), year (multi), sort, page, limit
router.get('/reports', async (req, res) => {
  try {
    const { q, sort } = req.query;
    const regionArr  = [req.query.region ].flat().filter(Boolean);
    const sectorArr  = [req.query.sector ].flat().filter(Boolean);
    const countryArr = [req.query.country].flat().filter(Boolean);
    const yearArr    = [req.query.year   ].flat().filter(Boolean);

    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 12, maxLimit: 48 });
    const sortOrder = sort === 'oldest' ? 'createdAt' : '-createdAt';

    const filter = { status: 'published' };

    if (q?.trim()) {
      filter.$or = [
        { projectName:       new RegExp(q.trim(), 'i') },
        { sector:            new RegExp(q.trim(), 'i') },
        { region:            new RegExp(q.trim(), 'i') },
        { projectBackground: new RegExp(q.trim(), 'i') },
        { countries:         new RegExp(q.trim(), 'i') },
      ];
    }
    if (regionArr.length)  filter.region    = { $in: regionArr };
    if (sectorArr.length)  filter.sector    = { $in: sectorArr };
    if (countryArr.length) filter.countries = { $in: countryArr };
    if (yearArr.length)    filter.fiscalYear = { $in: yearArr.map(yearToFiscal) };

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .select('projectName slug projectId images thumbnail region sector fiscalYear projectBackground livesImpacted countries locations'),
      Report.countDocuments(filter),
    ]);

    res.json({
      reports: reports.map(shapeCard),
      meta:    buildMeta({ page, limit, total }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/public/reports/:idOrSlug ────────────────────────────────
// Accepts either a MongoDB ObjectId or a slug string.
router.get('/reports/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const filter = isObjectId
      ? { _id: idOrSlug,  status: 'published' }
      : { slug: idOrSlug, status: 'published' };
    const report = await Report.findOne(filter);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const region = report.region || deriveRegion(report.countries);

    res.json({
      id:                report._id.toString(),
      slug:              report.slug      || report._id.toString(),
      projectId:         report.projectId || '',
      title:             report.projectName,
      image:             report.thumbnail || report.images?.[0]?.url || '',
      region,
      sector:            report.sector            || '',
      year:              deriveYear(report.fiscalYear),
      projectLead:       report.projectLead       || '',
      projectBackground: report.projectBackground || '',
      strategicResponse: report.strategicResponse || '',
      livesImpacted:     report.livesImpacted     || 0,
      demographics: {
        men:      report.men      || 0,
        women:    report.women    || 0,
        children: report.children || 0,
      },
      deliverables: report.deliverables || [],
      milestones:   (report.milestones || []).map((m) => ({
        date:        m.date  || '',
        title:       m.title || '',
        description: m.description || m.notes || '',
      })),
      images:    report.images    || [],
      videoUrl:  report.videoUrl  || '',
      countries: report.countries || [],
      locations: report.locations || [],
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Report not found' });
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/public/stats ───────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const base = { status: 'published' };
    const [total, livesAgg, countriesAgg] = await Promise.all([
      Report.countDocuments(base),
      Report.aggregate([
        { $match: base },
        { $group: { _id: null, lives: { $sum: '$livesImpacted' } } },
      ]),
      Report.aggregate([
        { $match: base },
        { $unwind: '$countries' },
        { $group: { _id: '$countries' } },
        { $count: 'total' },
      ]),
    ]);

    res.json({
      totalProjects:  total,
      totalLives:     livesAgg[0]?.lives ?? 0,
      totalCountries: countriesAgg[0]?.total ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/public/filters ──────────────────────────────────────────
router.get('/filters', async (req, res) => {
  try {
    const base = { status: 'published' };
    const [allReports, sectors, countries, fiscalYears] = await Promise.all([
      Report.find(base).select('region countries'),
      Report.distinct('sector',     { ...base, sector:    { $ne: '' } }),
      Report.distinct('countries',  base),
      Report.distinct('fiscalYear', { ...base, fiscalYear: { $ne: '' } }),
    ]);

    // Derive region from countries for reports that don't have it stored yet
    const regionSet = new Set();
    for (const r of allReports) {
      const reg = r.region || deriveRegion(r.countries);
      if (reg && reg !== 'Global') regionSet.add(reg);
    }

    res.json({
      regions:   [...regionSet].sort(),
      sectors:   sectors.sort(),
      countries: countries.filter(Boolean).sort(),
      years:     [...new Set(fiscalYears.map(deriveYear).filter(Boolean))].sort().reverse(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/public/search?q= ────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ results: [] });

    const regex = new RegExp(q.trim(), 'i');
    const base  = { status: 'published' };

    const [reportDocs, sectors, countryDocs, regions] = await Promise.all([
      Report.find({ ...base, projectName: regex }).select('projectName').limit(5),
      Report.distinct('sector', { ...base, sector: regex }),
      Report.aggregate([
        { $match: base },
        { $unwind: '$countries' },
        { $match: { countries: regex } },
        { $group: { _id: '$countries' } },
        { $limit: 5 },
      ]),
      Report.distinct('region', { ...base, region: regex }),
    ]);

    const results = [
      ...reportDocs.map(r  => ({ label: r.projectName, type: 'report',  id: r._id.toString(), icon: 'FiFileText' })),
      ...sectors.slice(0, 3).map(s => ({ label: s,      type: 'sector',  icon: 'FiBox'      })),
      ...countryDocs.slice(0, 3).map(c => ({ label: c._id, type: 'country', icon: 'FiFlag'  })),
      ...regions.slice(0, 2).map(r => ({ label: r,      type: 'region',  icon: 'FiGlobe'    })),
    ].slice(0, 8);

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
