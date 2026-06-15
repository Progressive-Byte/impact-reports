const ActionRow = ({ title, description, label, danger = false, onClick, loading = false }) => (
  <div className="flex items-center justify-between py-4">
    <div className="pr-6">
      <p className="text-sm font-bold text-[#0B0D0F]">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold border transition-colors disabled:opacity-60 ${
        danger
          ? 'border-[#E52321] text-[#E52321] hover:bg-red-50'
          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {label}
    </button>
  </div>
);

export default ActionRow;
