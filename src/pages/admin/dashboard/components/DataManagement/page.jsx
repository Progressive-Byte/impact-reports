import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import { publicApiRequest } from '../../../../../services/publicApi';
import { adminApiRequest } from '../../../../../services/adminApi';

const ListCard = ({ icon, title, subtitle, items, loading, onAdd, onUpdate, onRemove, addLabel, placeholder }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
    {/* Header */}
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <SafeIcon icon={icon} className="text-gray-600 text-sm" />
      </div>
      <div>
        <p className="text-sm font-black text-[#0B0D0F]">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>

    {/* List */}
    <div className="px-4 sm:px-6 py-5 space-y-3 overflow-y-auto max-h-[340px]">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No {title.toLowerCase()} yet. Add one below.</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <SafeIcon icon={icon} className="text-gray-400 text-xs" />
            </div>
            <input
              type="text"
              value={item}
              onChange={e => onUpdate(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all"
            />
            <button
              onClick={() => onRemove(idx)}
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
    <div className="px-4 sm:px-6 pb-6">
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#E52321] hover:text-[#E52321] text-gray-400 text-sm font-bold py-3 rounded-xl transition-colors"
      >
        <SafeIcon icon="FiPlus" className="text-base" />
        {addLabel}
      </button>
    </div>
  </div>
);

const DataManagement = () => {
  const [regions,     setRegions]     = useState([]);
  const [sectors,     setSectors]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [regData, secData, depData] = await Promise.all([
        publicApiRequest('/api/config/regions'),
        publicApiRequest('/api/config/sectors'),
        publicApiRequest('/api/config/departments'),
      ]);
      setRegions(regData.regions || []);
      setSectors(secData.sectors || []);
      setDepartments(depData.departments || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    const cleanedRegions     = regions.map(r => r.trim()).filter(Boolean);
    const cleanedSectors     = sectors.map(s => s.trim()).filter(Boolean);
    const cleanedDepartments = departments.map(d => d.trim()).filter(Boolean);

    if (cleanedRegions.length === 0) { toast.error('Add at least one region'); return; }
    if (cleanedSectors.length === 0) { toast.error('Add at least one sector'); return; }

    const dupRegion = cleanedRegions.find((r, i) => cleanedRegions.indexOf(r) !== i);
    if (dupRegion) { toast.error(`Duplicate region: "${dupRegion}"`); return; }

    const dupSector = cleanedSectors.find((s, i) => cleanedSectors.indexOf(s) !== i);
    if (dupSector) { toast.error(`Duplicate sector: "${dupSector}"`); return; }

    const dupDept = cleanedDepartments.find((d, i) => cleanedDepartments.indexOf(d) !== i);
    if (dupDept) { toast.error(`Duplicate department: "${dupDept}"`); return; }

    setSaving(true);
    try {
      const requests = [
        adminApiRequest('/api/config/regions', {
          method: 'PUT',
          body: JSON.stringify({ regions: cleanedRegions }),
        }),
        adminApiRequest('/api/config/sectors', {
          method: 'PUT',
          body: JSON.stringify({ sectors: cleanedSectors }),
        }),
      ];
      if (cleanedDepartments.length > 0) {
        requests.push(adminApiRequest('/api/config/departments', {
          method: 'PUT',
          body: JSON.stringify({ departments: cleanedDepartments }),
        }));
      }
      await Promise.all(requests);
      setRegions(cleanedRegions);
      setSectors(cleanedSectors);
      setDepartments(cleanedDepartments);
      toast.success('Data saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ListCard
          icon="FiGlobe"
          title="Regions"
          subtitle="Used in reports, user profiles, and invite forms"
          items={regions}
          loading={loading}
          onAdd={() => setRegions(p => [...p, ''])}
          onUpdate={(idx, val) => setRegions(p => p.map((r, i) => i === idx ? val : r))}
          onRemove={(idx) => setRegions(p => p.filter((_, i) => i !== idx))}
          addLabel="Add Region"
          placeholder="Region name"
        />

        <ListCard
          icon="FiTag"
          title="Sectors"
          subtitle="Used in report General tab (e.g. Healthcare, Education)"
          items={sectors}
          loading={loading}
          onAdd={() => setSectors(p => [...p, ''])}
          onUpdate={(idx, val) => setSectors(p => p.map((s, i) => i === idx ? val : s))}
          onRemove={(idx) => setSectors(p => p.filter((_, i) => i !== idx))}
          addLabel="Add Sector"
          placeholder="Sector name"
        />
      </div>
    </div>
  );
};

export default DataManagement;
