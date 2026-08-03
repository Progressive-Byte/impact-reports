import { useEffect, useRef, useState } from 'react';
import { Input } from './FormField';
import CustomSelect from './CustomSelect';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_OPTIONS = MONTHS.map(m => ({ value: m, label: m }));

const TYPES = [
  { value: 'single',   label: 'Single Year'    },
  { value: 'multiple', label: 'Multiple Years' },
  { value: 'range',    label: 'Date Range'     },
];

const EXAMPLES = {
  single:   'e.g. 2025',
  multiple: 'e.g. 2025–2027',
  range:    'e.g. Jan 2025 – Dec 2026',
};

const onlyDigits = (s) => s.replace(/\D/g, '').slice(0, 4);

function parseValue(value) {
  const v = (value || '').trim();
  const base = { year: '', startYear: '', endYear: '', startMonth: 'Jan', endMonth: 'Dec' };

  let m = v.match(/^(\d{4})$/);
  if (m) return { type: 'single', ...base, year: m[1] };

  m = v.match(/^(\d{4})\s*[–-]\s*(\d{4})$/);
  if (m) return { type: 'multiple', ...base, startYear: m[1], endYear: m[2] };

  m = v.match(/^([A-Za-z]{3,9})\.?\s+(\d{4})\s*[–-]\s*([A-Za-z]{3,9})\.?\s+(\d{4})$/);
  if (m) {
    const normMonth = (s) => MONTHS.find(mo => mo.toLowerCase() === s.slice(0, 3).toLowerCase()) || 'Jan';
    return { type: 'range', ...base, startMonth: normMonth(m[1]), startYear: m[2], endMonth: normMonth(m[3]), endYear: m[4] };
  }

  // Legacy ("FY26") or unrecognized text — best-effort digit extraction, default to Single Year
  const digits = v.match(/(\d+)/);
  const year = digits ? (digits[1].length <= 2 ? `20${digits[1].padStart(2, '0')}` : digits[1]) : '';
  return { type: 'single', ...base, year };
}

function compose(state) {
  const { type, year, startYear, endYear, startMonth, endMonth } = state;
  if (type === 'single')   return year || '';
  if (type === 'multiple') return startYear && endYear ? `${startYear}–${endYear}` : (startYear || endYear || '');
  if (type === 'range')    return startYear && endYear ? `${startMonth} ${startYear} – ${endMonth} ${endYear}` : '';
  return '';
}

const ReportingPeriodField = ({
  label = 'Reporting Period',
  required,
  value,
  onChange,
  error,
  rightLabel,
  className = '',
}) => {
  const [state, setState] = useState(() => parseValue(value));
  const lastEmitted = useRef(value);

  // Re-parse when the value changes from outside (e.g. a different report loaded into the wizard)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setState(parseValue(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const apply = (next) => {
    setState(next);
    const composed = compose(next);
    lastEmitted.current = composed;
    onChange(composed);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-[#E52321]">*</span>}
        </label>
        {rightLabel}
      </div>

      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 mb-2.5">
        {TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => apply({ ...state, type: t.value })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              state.type === t.value ? 'bg-white text-[#E52321] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {state.type === 'single' && (
        <Input
          placeholder={EXAMPLES.single}
          value={state.year}
          inputMode="numeric"
          onChange={e => apply({ ...state, year: onlyDigits(e.target.value) })}
          error={error}
        />
      )}

      {state.type === 'multiple' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Start year"
            value={state.startYear}
            inputMode="numeric"
            onChange={e => apply({ ...state, startYear: onlyDigits(e.target.value) })}
            error={error}
          />
          <Input
            placeholder="End year"
            value={state.endYear}
            inputMode="numeric"
            onChange={e => apply({ ...state, endYear: onlyDigits(e.target.value) })}
          />
        </div>
      )}

      {state.type === 'range' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <CustomSelect
              value={state.startMonth}
              onChange={v => apply({ ...state, startMonth: v })}
              options={MONTH_OPTIONS}
              placeholder="Month"
              className="w-20"
            />
            <Input
              placeholder="Year"
              value={state.startYear}
              inputMode="numeric"
              onChange={e => apply({ ...state, startYear: onlyDigits(e.target.value) })}
              error={error}
            />
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <CustomSelect
              value={state.endMonth}
              onChange={v => apply({ ...state, endMonth: v })}
              options={MONTH_OPTIONS}
              placeholder="Month"
              className="w-20"
            />
            <Input
              placeholder="Year"
              value={state.endYear}
              inputMode="numeric"
              onChange={e => apply({ ...state, endYear: onlyDigits(e.target.value) })}
            />
          </div>
        </div>
      )}

      {!error && (
        <p className="mt-1.5 text-xs text-gray-400">{EXAMPLES[state.type]}</p>
      )}
    </div>
  );
};

export default ReportingPeriodField;
