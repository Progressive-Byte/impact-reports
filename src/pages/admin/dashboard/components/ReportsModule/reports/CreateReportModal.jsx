import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import MultiSelect from './MultiSelect';
import { adminApiRequest } from '../../../../../../services/adminApi';

const CreateReportModal = ({ open, onClose, onCreated, adminOptions }) => {
  const [projectName,     setProjectName]     = useState('');
  const [actualProjectId, setActualProjectId] = useState('');
  const [assignedTo,      setAssignedTo]      = useState([]);
  const [suggestions,     setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const suggestRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) { setProjectName(''); setActualProjectId(''); setAssignedTo([]); setSuggestions([]); setShowSuggestions(false); }
  }, [open]);

  // Close suggestion list on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search existing project names after 300 ms
  useEffect(() => {
    if (!projectName.trim() || projectName.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await adminApiRequest(`/api/reports/search?q=${encodeURIComponent(projectName)}`);
        setSuggestions(data.suggestions || []);
        setShowSuggestions((data.suggestions || []).length > 0);
      } catch { /* ignore search errors */ }
    }, 300);
    return () => clearTimeout(t);
  }, [projectName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim())       return toast.error('Project name is required');
    if (assignedTo.length === 0)   return toast.error('Assign at least one user');

    setSubmitting(true);
    try {
      const data = await adminApiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ projectName: projectName.trim(), actualProjectId: actualProjectId.trim(), assignedTo }),
      });
      toast.success('Report created');
      onCreated(data.report);
    } catch (err) {
      toast.error(err.message || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-[#0B0D0F]">New Report</h3>
            <p className="text-xs text-gray-400 mt-0.5">Project details can be filled in next steps</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon="FiX" className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Project Name with autocomplete */}
          <div className="relative" ref={suggestRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span className="text-[#E52321]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Winter Relief Alpha"
              value={projectName}
              onChange={e => { setProjectName(e.target.value); if (!e.target.value.trim()) setShowSuggestions(false); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white placeholder:text-gray-400 transition-all focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec]"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setProjectName(s); setShowSuggestions(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <SafeIcon icon="FiSearch" className="text-gray-300 text-xs flex-shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actual Project ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Actual Project ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Burma Water 1001"
              value={actualProjectId}
              onChange={e => setActualProjectId(e.target.value)}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white placeholder:text-gray-400 transition-all focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec]"
            />
          </div>

          {/* Assigned To multi-select */}
          <MultiSelect
            label="Assigned To"
            required
            value={assignedTo}
            onChange={setAssignedTo}
            options={adminOptions}
            placeholder="Select team members..."
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Create &amp; Fill Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportModal;
