import express from 'express';
import Report from '../models/Report.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { deriveRegion } from '../utils/regionUtils.js';

const router = express.Router();

// Extracts a representative 4-digit year from a reporting period string, for
// sorting/filtering — "2025" → "2025", "2025–2027" → "2025",
// "Jan 2025 – Dec 2026" → "2025". Also handles legacy "FY25"/"FY2025" values.
function deriveYear(reportingPeriod) {
  const match = (reportingPeriod || '').match(/(\d+)/);
  if (!match) return '';
  const n = parseInt(match[1], 10);
  return n < 100 ? `20${String(n).padStart(2, '0')}` : String(n);
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function shapeCard(r) {
  const bg     = (r.projectBackground || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const region = r.region || deriveRegion(r.countries);
  const rawSummary = r.shortSubtitle?.trim() || bg;
  return {
    id:        r._id.toString(),
    slug:      r.slug      || r._id.toString(),
    projectId: r.actualProjectId || r.projectId || '',
    title:     r.projectName,
    image:     r.thumbnail || r.images?.[0]?.url || '',
    region,
    sector:    r.sector   || '',
    year:      deriveYear(r.reportingPeriod),
    summary:   rawSummary.length > 200 ? rawSummary.slice(0, 200).trimEnd() + '…' : rawSummary,
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
    if (yearArr.length)    filter.reportingPeriod = { $regex: yearArr.map(escapeRegex).join('|') };

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .select('projectName slug projectId actualProjectId shortSubtitle images thumbnail region sector reportingPeriod projectBackground livesImpacted countries locations'),
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
      projectId:         report.actualProjectId || report.projectId || '',
      title:             report.projectName,
      image:             report.thumbnail || report.images?.[0]?.url || '',
      region,
      sector:            report.sector            || '',
      year:              deriveYear(report.reportingPeriod),
      reportingPeriod:   report.reportingPeriod   || '',
      projectLead:       report.projectLead       || '',
      donationUrl:       report.donationUrl       || '',
      shortSubtitle:     report.shortSubtitle     || '',
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
      images:       report.images       || [],
      videoUrl:     report.videoUrl     || '',
      countries:    report.countries    || [],
      locations:    report.locations    || [],
      testimonials: report.testimonials || [],
      hiddenFields: report.hiddenFields || [],
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

// ── GET /api/public/locations-map ────────────────────────────────────
// Aggregates published reports into one entry per country they belong to,
// for the "All Locations Map" page's pins + per-country report list.
router.get('/locations-map', async (req, res) => {
  try {
    const base = { status: 'published' };

    const rows = await Report.aggregate([
      { $match: base },
      { $project: {
          projectName: 1, slug: 1, projectId: 1, actualProjectId: 1, shortSubtitle: 1,
          images: 1, thumbnail: 1, region: 1, sector: 1, reportingPeriod: 1,
          projectBackground: 1, livesImpacted: 1, countries: 1, locations: 1,
      } },
      // Alias before $unwind so the real `countries` array survives on each
      // pushed doc — $unwind overwrites the original field with a single string.
      { $addFields: { countryKey: '$countries' } },
      { $unwind: '$countryKey' },
      { $group: { _id: '$countryKey', reports: { $push: '$$ROOT' } } },
      { $project: { _id: 0, country: '$_id', reports: 1 } },
      { $sort: { country: 1 } },
    ]);

    const locations = rows.map(({ country, reports }) => {
      const sites = reports.flatMap((r) => {
        const reportSites = r.locations?.length > 0
          ? r.locations.filter((l) => l.country === country)
          : [{ address: country, lat: '', lng: '' }];
        return reportSites.map((s) => ({
          address:     s.address || country,
          lat:         s.lat || '',
          lng:         s.lng || '',
          region:      r.region || deriveRegion(r.countries),
          reportId:    r._id.toString(),
          reportSlug:  r.slug || r._id.toString(),
          reportTitle: r.projectName,
        }));
      });

      return {
        country,
        reportCount: reports.length,
        reports: reports.map(shapeCard),
        sites,
      };
    });

    res.json({ locations, totalCountries: locations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/public/filters ──────────────────────────────────────────
router.get('/filters', async (req, res) => {
  try {
    const base = { status: 'published' };
    const [allReports, sectors, countries, reportingPeriods] = await Promise.all([
      Report.find(base).select('region countries'),
      Report.distinct('sector',          { ...base, sector:          { $ne: '' } }),
      Report.distinct('countries',  base),
      Report.distinct('reportingPeriod', { ...base, reportingPeriod: { $ne: '' } }),
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
      years:     [...new Set(reportingPeriods.map(deriveYear).filter(Boolean))].sort().reverse(),
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

    const [reportByName, reportById, sectors, countryDocs, regions] = await Promise.all([
      Report.find({ ...base, projectName: regex })
        .select('projectName slug').limit(5),
      Report.find({ ...base, $or: [{ actualProjectId: regex }, { projectId: regex }] })
        .select('projectName actualProjectId projectId slug').limit(3),
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

    // Deduplicate report+id results by _id
    const seenIds = new Set();
    const reportResults = [];
    for (const r of reportByName) {
      seenIds.add(r._id.toString());
      reportResults.push({ label: r.projectName, type: 'report', id: r._id.toString(), slug: r.slug || r._id.toString(), icon: 'FiFileText' });
    }
    for (const r of reportById) {
      if (seenIds.has(r._id.toString())) continue;
      seenIds.add(r._id.toString());
      const displayId = r.actualProjectId || r.projectId || '';
      reportResults.push({ label: r.projectName, subtitle: displayId, type: 'id', id: r._id.toString(), slug: r.slug || r._id.toString(), icon: 'FiHash' });
    }

    const results = [
      ...reportResults.slice(0, 5),
      ...countryDocs.slice(0, 3).map(c => ({ label: c._id, type: 'country', icon: 'FiFlag'   })),
      ...regions.slice(0, 2).map(r     => ({ label: r,     type: 'region',  icon: 'FiGlobe'  })),
      ...sectors.slice(0, 2).map(s     => ({ label: s,     type: 'sector',  icon: 'FiBox'    })),
    ].slice(0, 10);

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
