import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import { publicApiRequest } from '../../../../../services/publicApi';
import { adminApiRequest } from '../../../../../services/adminApi';
import ListCard from './ListCard';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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

        <ListCard
          icon="FiBriefcase"
          title="Departments"
          subtitle="Used in user profiles and invite forms"
          items={departments}
          loading={loading}
          onAdd={() => setDepartments(p => [...p, ''])}
          onUpdate={(idx, val) => setDepartments(p => p.map((d, i) => i === idx ? val : d))}
          onRemove={(idx) => setDepartments(p => p.filter((_, i) => i !== idx))}
          addLabel="Add Department"
          placeholder="Department name"
        />
      </div>
    </div>
  );
};

export default DataManagement;
