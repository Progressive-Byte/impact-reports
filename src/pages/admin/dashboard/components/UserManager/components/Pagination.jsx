import SafeIcon from '../../../../../../common/SafeIcon';

const getPageNumbers = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const result = [];
  const left   = Math.max(2, page - 1);
  const right  = Math.min(pages - 1, page + 1);

  result.push(1);
  if (left > 2)       result.push('…');
  for (let i = left; i <= right; i++) result.push(i);
  if (right < pages - 1) result.push('…');
  result.push(pages);

  return result;
};

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.pages <= 1) return null;

  const { page, pages, total, limit, hasPrev, hasNext } = meta;
  const from  = (page - 1) * limit + 1;
  const to    = Math.min(page * limit, total);
  const items = getPageNumbers(page, pages);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">

      {/* Result count */}
      <p className="text-xs text-gray-400 font-medium hidden sm:block">
        Showing <span className="text-gray-700 font-bold">{from}–{to}</span> of{' '}
        <span className="text-gray-700 font-bold">{total}</span> users
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 mx-auto sm:mx-0">

        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <SafeIcon icon="FiChevronLeft" className="text-sm" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {items.map((item, idx) =>
            item === '…' ? (
              <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  item === page
                    ? 'bg-[#E52321] text-white shadow-sm'
                    : 'border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <SafeIcon icon="FiChevronRight" className="text-sm" />
        </button>
      </div>

      {/* Per-page hint */}
      <p className="text-xs text-gray-400 hidden sm:block">
        {limit} per page
      </p>
    </div>
  );
};

export default Pagination;
