import SafeIcon from '../../../../../../common/SafeIcon';
import Pagination from '@/common/Pagination';
import TableHead from './TableHead';
import ReportSkeletonRow from './ReportSkeletonRow';
import LedgerToolbar from './LedgerToolbar';
import BulkActionBar from './BulkActionBar';
import ReportRow from './ReportRow';

const SKELETON_ROWS = 5;

const STATUS_DOT = {
  published:        'bg-green-500',
  pending:          'bg-yellow-400',
  pending_approval: 'bg-blue-400',
  trash:            'bg-red-400',
};

const STATUS_LABELS = {
  pending_approval: 'For Review',
};

const RecordLedger = ({
  reports = [],
  loading = false,
  meta    = null,
  tabCounts = {},
  // filter state
  inputSearch, setInputSearch, isDebouncing,
  urlSearch, urlStatus, urlSort,
  // handlers
  onStatusChange, onSortChange, onPageChange, onRefresh,
  // role context
  isSuperAdmin,
  // selection
  selected = new Set(),
  allSelected = false,
  selectedCount = 0,
  onToggleAll,
  onToggleOne,
  // table actions
  isViewer = false,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onBulkDelete,
}) => {
  const showSkeleton = loading || isDebouncing;
  const isTrash      = urlStatus === 'trash';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      <LedgerToolbar
        inputSearch={inputSearch}
        setInputSearch={setInputSearch}
        isDebouncing={isDebouncing}
        urlSearch={urlSearch}
        urlStatus={urlStatus}
        urlSort={urlSort}
        meta={meta}
        loading={loading}
        tabCounts={tabCounts}
        isSuperAdmin={isSuperAdmin}
        onStatusChange={onStatusChange}
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />

      {/* Active filter pills */}
      {(urlSearch || urlStatus !== 'all') && !showSkeleton && (
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters:</span>

          {urlSearch && (
            <span className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1 rounded-full">
              <SafeIcon icon="FiSearch" className="text-[10px] text-gray-400" />
              &quot;{urlSearch}&quot;
              <button onClick={() => setInputSearch('')} className="text-gray-300 hover:text-gray-500 ml-0.5">
                <SafeIcon icon="FiX" className="text-[10px]" />
              </button>
            </span>
          )}

          {urlStatus !== 'all' && (
            <span className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1 rounded-full capitalize">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[urlStatus] ?? 'bg-gray-400'}`} />
              {STATUS_LABELS[urlStatus] ?? urlStatus}
              <button onClick={() => onStatusChange('all')} className="text-gray-300 hover:text-gray-500 ml-0.5">
                <SafeIcon icon="FiX" className="text-[10px]" />
              </button>
            </span>
          )}

          {meta && (
            <span className="text-[11px] text-gray-400 ml-auto">
              {meta.total} result{meta.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {isSuperAdmin && (
        <BulkActionBar
          selectedCount={selectedCount}
          onBulkDelete={onBulkDelete}
          isTrash={isTrash}
        />
      )}

      {/* Table — horizontal scroll below lg */}
      <div className="overflow-x-auto lg:overflow-x-visible">
        <div className="min-w-[860px] lg:min-w-0">
          <TableHead allSelected={allSelected} onToggleAll={onToggleAll} />

          <div className="divide-y divide-gray-100">
            {showSkeleton ? (
              Array.from({ length: meta?.limit ?? SKELETON_ROWS }).map((_, i) => (
                <ReportSkeletonRow key={i} />
              ))
            ) : reports.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <SafeIcon
                  icon={urlSearch ? 'FiSearch' : isTrash ? 'FiTrash2' : 'FiClipboard'}
                  className="text-gray-200 text-3xl mx-auto mb-3"
                />
                <p className="text-sm text-gray-400">
                  {urlSearch
                    ? `No reports matching "${urlSearch}"`
                    : isTrash
                      ? 'Trash is empty.'
                      : urlStatus !== 'all'
                        ? `No ${urlStatus} reports found.`
                        : 'No reports yet.'}
                </p>
                {(urlSearch || (urlStatus !== 'all' && !isTrash)) && (
                  <button
                    onClick={() => { setInputSearch(''); onStatusChange('all'); }}
                    className="mt-3 text-sm font-bold text-[#E52321] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              reports.map(entry => (
                <ReportRow
                  key={entry._id}
                  entry={entry}
                  isSelected={selected.has(entry._id)}
                  isSuperAdmin={isSuperAdmin}
                  isViewer={isViewer}
                  isTrash={isTrash}
                  onToggleOne={onToggleOne}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Pagination meta={meta} onPageChange={onPageChange} label="reports" />
    </div>
  );
};

export default RecordLedger;
