import { useState } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';
import Pagination from '@/common/Pagination';
import TableHead from './TableHead';
import ReportSkeletonRow from './ReportSkeletonRow';
import LedgerToolbar from './LedgerToolbar';

const SKELETON_ROWS = 5;

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  draft:     'bg-gray-100 text-gray-500',
  published: 'bg-green-50 text-green-700 border border-green-200',
};

const ROW_GRID = 'grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-6';

const RecordLedger = ({
  // data
  reports = [],
  loading = false,
  meta    = null,
  // filter state
  inputSearch, setInputSearch, isDebouncing,
  urlSearch, urlStatus, urlSort,
  // handlers
  onStatusChange, onSortChange, onPageChange, onRefresh,
  // table actions
  isSuperAdmin,
  onEdit,
  onDelete,
}) => {
  const [confirmId, setConfirmId] = useState(null);
  const showSkeleton = loading || isDebouncing;

  const handleConfirmDelete = (id) => {
    onDelete?.(id);
    setConfirmId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {/* Toolbar row */}
      <LedgerToolbar
        inputSearch={inputSearch}
        setInputSearch={setInputSearch}
        isDebouncing={isDebouncing}
        urlSearch={urlSearch}
        urlStatus={urlStatus}
        urlSort={urlSort}
        meta={meta}
        loading={loading}
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
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                urlStatus === 'published' ? 'bg-green-500'
                : urlStatus === 'pending' ? 'bg-yellow-400'
                : 'bg-gray-400'
              }`} />
              {urlStatus}
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

      {/* Table header */}
      <TableHead />

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {showSkeleton ? (
          Array.from({ length: meta?.limit ?? SKELETON_ROWS }).map((_, i) => (
            <ReportSkeletonRow key={i} />
          ))
        ) : reports.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <SafeIcon
              icon={urlSearch ? 'FiSearch' : 'FiClipboard'}
              className="text-gray-200 text-3xl mx-auto mb-3"
            />
            <p className="text-sm text-gray-400">
              {urlSearch
                ? `No reports matching "${urlSearch}"`
                : urlStatus !== 'all'
                  ? `No ${urlStatus} reports found.`
                  : 'No reports yet.'}
            </p>
            {(urlSearch || urlStatus !== 'all') && (
              <button
                onClick={() => { setInputSearch(''); onStatusChange('all'); }}
                className="mt-3 text-sm font-bold text-[#E52321] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          reports.map(entry => {
            const assigneeNames = (entry.assignedTo || [])
              .map(a => a.username || a.email)
              .join(', ');

            return (
              <div key={entry._id} className={`${ROW_GRID} py-4 hover:bg-gray-50/60 transition-colors`}>

                <p className="text-sm font-bold text-[#0B0D0F] truncate">{entry.projectName}</p>

                <p className="text-sm font-black text-[#0B0D0F]">
                  {entry.livesImpacted ? entry.livesImpacted.toLocaleString() : '—'}
                </p>

                <span className={`text-[10px] font-black uppercase rounded px-2.5 py-1 w-fit ${STATUS_STYLES[entry.status] ?? STATUS_STYLES.draft}`}>
                  {entry.status}
                </span>

                <div className="flex items-center gap-1.5 min-w-0">
                  <SafeIcon icon="FiUser" className="text-gray-400 text-xs flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">{assigneeNames || '—'}</span>
                </div>

                <span className="text-xs text-gray-400 tabular-nums">
                  {entry.createdAt ? entry.createdAt.slice(0, 10) : '—'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {confirmId === entry._id ? (
                    <>
                      <button
                        onClick={() => handleConfirmDelete(entry._id)}
                        className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit?.(entry)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0B0D0F] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <SafeIcon icon="FiEdit2" className="text-sm" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setConfirmId(entry._id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#E52321] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <SafeIcon icon="FiTrash2" className="text-sm" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination meta={meta} onPageChange={onPageChange} label="reports" />
    </div>
  );
};

export default RecordLedger;
