import { useState } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';
import TableHead from './TableHead';

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  draft:     'bg-gray-100 text-gray-500',
  published: 'bg-green-50 text-green-700 border border-green-200',
};

const COLUMNS = ['Project', 'Lives Impacted', 'Status', 'Assignees', 'Date', 'Actions'];
const ROW_GRID = 'grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-6';


const SkeletonRow = () => (
  <div className={`${ROW_GRID} py-4 animate-pulse`}>
    <div className="h-4 bg-gray-100 rounded w-3/4" />
    <div className="h-4 bg-gray-100 rounded w-10" />
    <div className="h-6 bg-gray-100 rounded-full w-20" />
    <div className="h-4 bg-gray-100 rounded w-28" />
    <div className="h-4 bg-gray-100 rounded w-20" />
    <div className="flex gap-2">
      <div className="h-8 w-8 bg-gray-100 rounded-lg" />
      <div className="h-8 w-8 bg-gray-100 rounded-lg" />
    </div>
  </div>
);

const RecordLedger = ({
  reports = [],
  loading = false,
  search  = '',
  sort    = 'recent',
  isSuperAdmin,
  onEdit,
  onDelete,
}) => {
  const [confirmId, setConfirmId] = useState(null);

  // Status filter is server-side; only search + sort are applied client-side
  const entries = reports
    .filter(r => (r.projectName || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === 'recent'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const handleConfirmDelete = (id) => {
    onDelete?.(id);
    setConfirmId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <TableHead />

      <div className="divide-y divide-gray-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : entries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <SafeIcon icon="FiClipboard" className="text-gray-200 text-3xl mx-auto mb-3" />
            <p className="text-sm text-gray-400">No reports found.</p>
          </div>
        ) : (
          entries.map(entry => {
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
    </div>
  );
};

export default RecordLedger;
