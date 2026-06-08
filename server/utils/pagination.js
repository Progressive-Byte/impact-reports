function clampInt(value, { min, max, fallback }) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

export function parsePagination(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
  const page  = clampInt(query?.page,  { min: 1,   max: 1_000_000, fallback: 1 });
  const limit = clampInt(query?.limit, { min: 1,   max: maxLimit,  fallback: defaultLimit });
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta({ page, limit, total }) {
  const pages   = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < pages;
  return { page, limit, total, pages, hasPrev, hasNext };
}
