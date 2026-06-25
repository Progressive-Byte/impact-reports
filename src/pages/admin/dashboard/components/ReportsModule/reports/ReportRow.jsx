import { useState } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';
import Checkbox from '../../../common/Checkbox';
import { ROW_GRID } from './TableHead';

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

const ReportRow = ({
  entry,
  isSelected,
  isSuperAdmin,
  isViewer,
  isTrash,
  onToggleOne,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  const [confirming, setConfirming] = useState(false);

  const assigneeNames = (entry.assignedTo || [])
    .map(a => a.username || a.email)
    .join(', ');

  const approvalReviewerName = entry.approvalAssignedTo
    ? (entry.approvalAssignedTo.username || entry.approvalAssignedTo.email)
    : null;

  const handleConfirm = () => {
    setConfirming(false);
    if (isTrash) onPermanentDelete?.(entry._id);
    else onDelete?.(entry._id);
  };

  return (
    <div
      className={`${ROW_GRID} py-4 transition-colors ${
        isSelected ? 'bg-red-50/30' : 'hover:bg-gray-50/60'
      }`}
    >
      {/* Checkbox */}
      {isSuperAdmin
        ? <Checkbox checked={isSelected} onChange={() => onToggleOne?.(entry._id)} />
        : <span />
      }

      {/* Project name */}
      <p className="text-sm font-bold text-[#0B0D0F] truncate">{entry.projectName}</p>

      {/* Project ID */}
      <p className="text-xs text-gray-500 truncate">
        {entry.actualProjectId || <span className="text-gray-300">—</span>}
      </p>

      {/* Lives impacted */}
      <p className="text-sm font-black text-[#0B0D0F]">
        {entry.livesImpacted ? entry.livesImpacted.toLocaleString() : '—'}
      </p>

      {/* Status badge */}
      <span className={`text-[10px] font-black uppercase rounded px-2.5 py-1 w-fit ${STATUS_STYLES[entry.status] ?? STATUS_STYLES.draft}`}>
        {STATUS_LABELS[entry.status] ?? entry.status}
      </span>

      {/* Assignees */}
      <div className="flex items-center gap-1.5 min-w-0">
        <SafeIcon icon="FiUser" className="text-gray-400 text-xs flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate">{assigneeNames || '—'}</span>
      </div>

      {/* Approval reviewer */}
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

      {/* Created */}
      <span className="text-xs text-gray-400 tabular-nums">
        {entry.createdAt ? entry.createdAt.slice(0, 10) : '—'}
      </span>

      {/* Last edit */}
      <span className="text-xs text-gray-400 tabular-nums">
        {entry.updatedAt ? entry.updatedAt.slice(0, 10) : '—'}
      </span>

      {/* Row actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {confirming ? (
          <>
            <button
              onClick={handleConfirm}
              className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            >
              {isTrash ? 'Delete Forever' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirming(false)}
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
                onClick={() => setConfirming(true)}
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
                onClick={() => setConfirming(true)}
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
};

export default ReportRow;
