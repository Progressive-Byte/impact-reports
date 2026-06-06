import SafeIcon from '../../../../../../common/SafeIcon';

const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-500',
  published: 'bg-green-50 text-green-700 border border-green-200',
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const MOCK_ENTRIES = [
  { id: 1, title: 'Winter Relief Alpha',    status: 'draft',     livesImpacted: 4800,  assignee: 'Marcus Chen', date: '2024-01-20' },
  { id: 2, title: 'Jordan Water Access Q2', status: 'published', livesImpacted: 12500, assignee: 'Sarah Ahmad',  date: '2024-02-15' },
  { id: 3, title: 'Syria Education Drive',  status: 'pending',   livesImpacted: 3200,  assignee: 'Ali Hassan',   date: '2024-03-08' },
  { id: 4, title: 'Lebanon Food Security',  status: 'published', livesImpacted: 8900,  assignee: 'Marcus Chen', date: '2024-03-22' },
];

const RecordLedger = ({ filter = 'all', search = '', sort = 'recent' }) => {
  const entries = MOCK_ENTRIES
    .filter(e =>
      (filter === 'all' || e.status === filter) &&
      e.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sort === 'recent' ? b.id - a.id : a.id - b.id);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <SafeIcon icon="FiList" className="text-gray-400 text-base" />
        <h3 className="text-sm font-black text-[#0B0D0F]">Record Ledger</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {entries.map(entry => (
          <div key={entry.id} className="px-5 py-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-bold text-[#0B0D0F] leading-tight">{entry.title}</p>
              <span className={`text-[10px] font-black uppercase rounded px-2 py-0.5 flex-shrink-0 ml-2 ${STATUS_STYLES[entry.status]}`}>
                {entry.status}
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lives Impacted</p>
            <div className="flex items-end justify-between">
              <p className="text-xl font-black text-[#0B0D0F]">{entry.livesImpacted.toLocaleString()}</p>
              <div className="text-right">
                <p className="text-[11px] text-gray-500 flex items-center gap-1 justify-end">
                  <SafeIcon icon="FiUser" className="text-[11px]" />
                  {entry.assignee}
                </p>
                <p className="text-[11px] text-gray-400">{entry.date}</p>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No records found.</div>
        )}
      </div>
    </div>
  );
};

export default RecordLedger;
