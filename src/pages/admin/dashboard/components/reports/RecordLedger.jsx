import { useState } from 'react';
import SafeIcon from '../../../../../common/SafeIcon';

const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-500',
  published: 'bg-green-50 text-green-700 border border-green-200',
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const MOCK_ENTRIES = [
  { id: 1, title: 'Winter Relief Alpha',     status: 'draft',     livesImpacted: 4800,  assignee: 'Marcus Chen', date: '2024-01-20' },
  { id: 2, title: 'Jordan Water Access Q2',  status: 'published', livesImpacted: 12500, assignee: 'Sarah Ahmad',  date: '2024-02-15' },
  { id: 3, title: 'Syria Education Drive',   status: 'pending',   livesImpacted: 3200,  assignee: 'Ali Hassan',   date: '2024-03-08' },
  { id: 4, title: 'Lebanon Food Security',   status: 'published', livesImpacted: 8900,  assignee: 'Marcus Chen', date: '2024-03-22' },
];

const FILTERS = ['all', 'published', 'pending'];

const RecordLedger = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('recent');

  const entries = MOCK_ENTRIES
    .filter(e => (filter === 'all' || e.status === filter) && e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'recent' ? b.id - a.id : a.id - b.id);

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex gap-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 focus:outline-none bg-white appearance-none pr-8 cursor-pointer"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
          <SafeIcon icon="FiChevronDown" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
        </div>
      </div>

      {/* Ledger card */}
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
    </div>
  );
};

export default RecordLedger;
