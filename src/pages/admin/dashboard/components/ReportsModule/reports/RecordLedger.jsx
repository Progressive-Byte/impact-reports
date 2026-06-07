import { useState } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';

const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-500',
  published: 'bg-green-50 text-green-700 border border-green-200',
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const COLUMNS = ['Project', 'Lives Impacted', 'Status', 'Assignee', 'Date', 'Actions'];

const MOCK_ENTRIES = [
  { id: 1, title: 'Winter Relief Alpha',    status: 'draft',     livesImpacted: 4800,  assignee: 'Marcus Chen', date: '2024-01-20' },
  { id: 2, title: 'Jordan Water Access Q2', status: 'published', livesImpacted: 12500, assignee: 'Sarah Ahmad',  date: '2024-02-15' },
  { id: 3, title: 'Syria Education Drive',  status: 'pending',   livesImpacted: 3200,  assignee: 'Ali Hassan',   date: '2024-03-08' },
  { id: 4, title: 'Lebanon Food Security',  status: 'published', livesImpacted: 8900,  assignee: 'Marcus Chen',  date: '2024-03-22' },
];

const ROW_GRID = 'grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-6';

const RecordLedger = ({ filter = 'all', search = '', sort = 'recent', onEdit }) => {
  const [deleteId, setDeleteId] = useState(null);

  const entries = MOCK_ENTRIES
    .filter(e =>
      (filter === 'all' || e.status === filter) &&
      e.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sort === 'recent' ? b.id - a.id : a.id - b.id);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table head */}
      <div className={`${ROW_GRID} py-3 border-b border-gray-100 bg-gray-50/70`}>
        {COLUMNS.map(col => (
          <span key={col} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {entries.map(entry => (
          <div key={entry.id} className={`${ROW_GRID} py-4 hover:bg-gray-50/60 transition-colors`}>
            <p className="text-sm font-bold text-[#0B0D0F] truncate">{entry.title}</p>

            <p className="text-sm font-black text-[#0B0D0F]">{entry.livesImpacted.toLocaleString()}</p>

            <span className={`text-[10px] font-black uppercase rounded px-2.5 py-1 w-fit ${STATUS_STYLES[entry.status]}`}>
              {entry.status}
            </span>

            <div className="flex items-center gap-1.5 min-w-0">
              <SafeIcon icon="FiUser" className="text-gray-400 text-xs flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">{entry.assignee}</span>
            </div>

            <span className="text-xs text-gray-400 tabular-nums">{entry.date}</span>

            <div className="flex items-center gap-1 flex-shrink-0">
              {deleteId === entry.id ? (
                <>
                  <button
                    onClick={() => setDeleteId(null)}
                    className="text-[10px] font-black text-[#E52321] bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteId(null)}
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
                  <button
                    onClick={() => setDeleteId(entry.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#E52321] hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <SafeIcon icon="FiTrash2" className="text-sm" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">No records found.</div>
        )}
      </div>
    </div>
  );
};

export default RecordLedger;
