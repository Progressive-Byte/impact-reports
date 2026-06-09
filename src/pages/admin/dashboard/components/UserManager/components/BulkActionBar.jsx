const BulkActionBar = ({ selectedCount }) => (
  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/40">
    <p className="text-sm font-medium text-gray-500">
      Selected:{' '}
      <span className={`font-black ${selectedCount > 0 ? 'text-[#E52321]' : 'text-gray-700'}`}>
        {selectedCount}
      </span>
    </p>
    <div className="flex items-center gap-2">
      <button
        disabled={selectedCount === 0}
        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Reset Passwords
      </button>
      <button
        disabled={selectedCount === 0}
        className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          selectedCount > 0
            ? 'border-red-200 text-[#E52321] hover:bg-red-50'
            : 'border-gray-200 text-gray-400'
        }`}
      >
        Deactivate Selected
      </button>
    </div>
  </div>
);

export default BulkActionBar;
