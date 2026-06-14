/**
 * Converts a project name to a URL-safe slug.
 * e.g. "Ilm & Light" → "ilm-and-light"
 */
export function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Returns a slug guaranteed to be unique in the Report collection.
 * Appends -2, -3, … if the base slug is already taken.
 */
export async function uniqueSlug(Report, base, excludeId = null) {
  let slug = base;
  let suffix = 2;
  while (true) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Report.exists(filter);
    if (!exists) return slug;
    slug = `${base}-${suffix++}`;
  }
}
