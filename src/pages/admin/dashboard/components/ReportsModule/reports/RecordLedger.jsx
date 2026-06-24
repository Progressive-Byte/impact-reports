import { useState } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';
import Checkbox from '../../../common/Checkbox';
import Pagination from '@/common/Pagination';
import TableHead, { ROW_GRID } from './TableHead';
import ReportSkeletonRow from './ReportSkeletonRow';
import LedgerToolbar from './LedgerToolbar';

const SKELETON_ROWS = 5;

const STATUS_STYLES = {
  pending:          'bg-yellow-50 text-yellow-700 border border-yellow-200',
  draft:            'bg-gray-100 text-gray-500',
  published:        'bg-green-50 text-green-700 border border-green-200',
  pending_approval: 'bg-blue-50 text-blue-700 border border-blue-200',
  trash:            'bg-red-50 text-red-400 border border-red-100',
};

const STATUS_LABELS = {
  pending_approval: 'For Review',
};

// ── Bulk action bar ───────────────────────────────────────────────────────────
const BulkActionBar = ({ selectedCount, onBulkDelete, isTrash }) => {
  const [confirming, setConfirming] = useState(false);

  const idleLabel    = isTrash ? 'Delete Permanently' : 'Move to Trash';
  const confirmLabel = isTrash ? 'Delete Forever'     : 'Confirm';
  const confirmText  = isTrash
    ? `Permanently delete ${selectedCount} report${selectedCount !== 1 ? 's' : ''}? This cannot be undone.`
    : `Move ${selectedCount} report${selectedCount !== 1 ? 's' : ''} to Trash?`;

  const handleClick = () => {
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    onBulkDelete();
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/40">
      <p className="text-sm font-medium text-gray-500">
        Selected:{' '}
        <span className={`font-black ${selectedCount > 0 ? 'text-[#E52321]' : 'text-gray-700'}`}>
          {selectedCount}
        </span>
      </p>

      <div className="flex items-center gap-2">
        {confirming && (
          <span className="text-xs text-gray-500 font-medium">{confirmText}</span>
        )}
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          disabled={selectedCount === 0}
          onClick={handleClick}
          className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            confirming
              ? 'border-red-400 bg-[#E52321] text-white hover:bg-[#c91d1b]'
              : selectedCount > 0
                ? 'border-red-200 text-[#E52321] hover:bg-red-50'
                : 'border-gray-200 text-gray-400'
          }`}
        >
          {confirming ? confirmLabel : idleLabel}
        </button>
      </div>
    </div>
  );
};

// ── RecordLedger ──────────────────────────────────────────────────────────────

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
  isSuperAdmin,
  isViewer = false,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onBulkDelete,
}) => {
  const [confirmId, setConfirmId] = useState(null);
  const showSkeleton = loading || isDebouncing;
  const isTrash = urlStatus === 'trash';

  const handleConfirmDelete = (id) => {
    if (isTrash) onPermanentDelete?.(id);
    else onDelete?.(id);
    setConfirmId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {/* Toolbar */}
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
                urlStatus === 'published'        ? 'bg-green-500'
                : urlStatus === 'pending'        ? 'bg-yellow-400'
                : urlStatus === 'pending_approval' ? 'bg-blue-400'
                : urlStatus === 'trash'          ? 'bg-red-400'
                : 'bg-gray-400'
              }`} />
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

      {/* Bulk action bar — visible to superadmin only */}
      {isSuperAdmin && (
        <BulkActionBar
          selectedCount={selectedCount}
          onBulkDelete={onBulkDelete}
          isTrash={isTrash}
        />
      )}

      {/* Table header */}
      <TableHead allSelected={allSelected} onToggleAll={onToggleAll} />

      {/* Rows */}
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
          reports.map(entry => {
            const assigneeNames = (entry.assignedTo || [])
              .map(a => a.username || a.email)
              .join(', ');
            const approvalReviewerName = entry.approvalAssignedTo
              ? (entry.approvalAssignedTo.username || entry.approvalAssignedTo.email)
              : null;

            const isSelected = selected.has(entry._id);

            return (
              <div
                key={entry._id}
                className={`${ROW_GRID} py-4 transition-colors ${
                  isSelected ? 'bg-red-50/30' : 'hover:bg-gray-50/60'
                }`}
              >
                {/* Checkbox */}
                {isSuperAdmin ? (
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleOne?.(entry._id)}
                  />
                ) : (
                  <span />
                )}

                <p className="text-sm font-bold text-[#0B0D0F] truncate">{entry.projectName}</p>

                <p className="text-xs text-gray-500 truncate">
                  {entry.actualProjectId || <span className="text-gray-300">—</span>}
                </p>

                <p className="text-sm font-black text-[#0B0D0F]">
                  {entry.livesImpacted ? entry.livesImpacted.toLocaleString() : '—'}
                </p>

                <span className={`text-[10px] font-black uppercase rounded px-2.5 py-1 w-fit ${STATUS_STYLES[entry.status] ?? STATUS_STYLES.draft}`}>
                  {STATUS_LABELS[entry.status] ?? entry.status}
                </span>

                <div className="flex items-center gap-1.5 min-w-0">
                  <SafeIcon icon="FiUser" className="text-gray-400 text-xs flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">{assigneeNames || '—'}</span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  {approvalReviewerName ? (
                    <>
                      <SafeIcon icon="FiCheckCircle" className="text-blue-400 text-xs flex-shrink-0" />
                      <span className="text-xs text-blue-700 truncate font-medium">{approvalReviewerName}</span>
                    </>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </div>

                <span className="text-xs text-gray-400 tabular-nums">
                  {entry.createdAt ? entry.createdAt.slice(0, 10) : '—'}
                </span>

                <span className="text-xs text-gray-400 tabular-nums">
                  {entry.updatedAt ? entry.updatedAt.slice(0, 10) : '—'}
                </span>

                {/* Row actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {confirmId === entry._id ? (
                    <>
                      <button
                        onClick={() => handleConfirmDelete(entry._id)}
                        className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        {isTrash ? 'Delete Forever' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : isTrash ? (
                    <>
                      {isSuperAdmin && (
                        <button
                          onClick={() => onRestore?.(entry._id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <SafeIcon icon="FiRotateCcw" className="text-sm" />
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button
                          onClick={() => setConfirmId(entry._id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#E52321] hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Permanently"
                        >
                          <SafeIcon icon="FiTrash2" className="text-sm" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit?.(entry)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0B0D0F] hover:bg-gray-100 rounded-lg transition-colors"
                        title={isViewer ? 'View' : 'Edit'}
                      >
                        <SafeIcon icon={isViewer ? 'FiEye' : 'FiEdit2'} className="text-sm" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setConfirmId(entry._id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#E52321] hover:bg-red-50 rounded-lg transition-colors"
                          title="Move to Trash"
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
