const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
      checked ? 'bg-green-500' : 'bg-gray-200'
    }`}
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
      checked ? 'translate-x-5' : 'translate-x-0.5'
    }`} />
  </button>
);

export default Toggle;
