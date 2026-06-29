const ToolbarBtn = ({ onMouseDown, active, title, children }) => (
  <button
    type="button"
    onMouseDown={onMouseDown}
    title={title}
    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
      active
        ? 'bg-[#E52321] text-white'
        : 'text-gray-500 hover:bg-gray-100 hover:text-[#0B0D0F]'
    }`}
  >
    {children}
  </button>
);

export default ToolbarBtn;
