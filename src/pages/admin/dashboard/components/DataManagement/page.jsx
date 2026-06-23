import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import { publicApiRequest } from '../../../../../services/publicApi';
import { adminApiRequest } from '../../../../../services/adminApi';

const DataManagement = () => {
  const [regions,  setRegions]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicApiRequest('/api/config/regions');
      setRegions(data.regions || []);
    } catch {
      toast.error('Failed to load regions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegions(); }, [fetchRegions]);

  const addRegion = () => setRegions(prev => [...prev, '']);

  const updateRegion = (idx, val) =>
    setRegions(prev => prev.map((r, i) => (i === idx ? val : r)));

  const removeRegion = (idx) =>
    setRegions(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const cleaned = regions.map(r => r.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.error('Add at least one region');
      return;
    }
    const dupes = cleaned.filter((r, i) => cleaned.indexOf(r) !== i);
    if (dupes.length) {
      toast.error(`Duplicate region: "${dupes[0]}"`);
      return;
    }
    setSaving(true);
    try {
      await adminApiRequest('/api/config/regions', {
        method: 'PUT',
        body: JSON.stringify({ regions: cleaned }),
      });
      setRegions(cleaned);
      toast.success('Regions saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save regions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Data Management"
        subtitle="Manage lookup data used across reports and users"
        action={
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <SafeIcon icon="FiSave" className="text-base" />
            }
            Save Changes
          </button>
        }
      />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <SafeIcon icon="FiGlobe" className="text-gray-600 text-sm" />
          </div>
          <div>
            <p className="text-sm font-black text-[#0B0D0F]">Regions</p>
            <p className="text-xs text-gray-400">Used in reports, user profiles, and invite forms</p>
          </div>
        </div>

        {/* Region list */}
        <div className="px-6 py-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : regions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No regions yet. Add one below.</p>
          ) : (
            regions.map((region, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <SafeIcon icon="FiMapPin" className="text-gray-400 text-xs" />
                </div>
                <input
                  type="text"
                  value={region}
                  onChange={e => updateRegion(idx, e.target.value)}
                  placeholder="Region name"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all"
                />
                <button
                  onClick={() => removeRegion(idx)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-[#E52321] hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <SafeIcon icon="FiTrash2" className="text-sm" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add button */}
        <div className="px-6 pb-6">
          <button
            onClick={addRegion}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#E52321] hover:text-[#E52321] text-gray-400 text-sm font-bold py-3 rounded-xl transition-colors"
          >
            <SafeIcon icon="FiPlus" className="text-base" />
            Add Region
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
