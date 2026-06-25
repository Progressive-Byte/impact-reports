import { useState } from 'react';

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

export default BulkActionBar;
