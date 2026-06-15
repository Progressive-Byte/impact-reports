import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../common/SafeIcon';
import PageHeader from '../../common/PageHeader';
import SettingCard from './components/SettingCard';
import ToggleRow from './components/ToggleRow';
import SelectRow from './components/SelectRow';
import ActionRow from './components/ActionRow';
import SettingsSkeleton from './components/SettingsSkeleton';
import { publicApiRequest } from '../../../../../services/publicApi';
import { adminApiRequest } from '../../../../../services/adminApi';

const TIMEOUT_OPTIONS = [
  { value: '15',  label: '15 minutes' },
  { value: '30',  label: '30 minutes' },
  { value: '60',  label: '1 hour' },
  { value: '120', label: '2 hours' },
];

const TIMEZONE_OPTIONS = [
  { value: 'utc0', label: 'UTC+0 (London)' },
  { value: 'utc3', label: 'UTC+3 (Amman)' },
  { value: 'utc5', label: 'UTC+5 (Karachi)' },
  { value: 'utc8', label: 'UTC+8 (Singapore)' },
];

const CURRENCY_OPTIONS = [
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
  { value: 'gbp', label: 'GBP (£)' },
];

const Settings = () => {
  const [regionOptions, setRegionOptions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);

  const [security, setSecurity] = useState({
    require2fa:      true,
    strongPasswords: true,
    sessionTimeout:  '30',
  });

  const [general, setGeneral] = useState({
    region:   '',
    timezone: 'utc3',
    currency: 'usd',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts:         true,
    weeklyDigest:        false,
    failedLoginWarnings: true,
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [regionsData, settingsData] = await Promise.all([
        publicApiRequest('/api/config/regions'),
        adminApiRequest('/api/config/settings'),
      ]);
      const opts = (regionsData.regions || []).map(r => ({ value: r, label: r }));
      setRegionOptions(opts);
      const saved = settingsData.defaultRegion;
      setGeneral(p => ({
        ...p,
        region: saved || (opts[0]?.value ?? ''),
      }));
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const setSec  = (key) => (val) => setSecurity(p => ({ ...p, [key]: val }));
  const setGen  = (key) => (val) => setGeneral(p => ({ ...p, [key]: val }));
  const setNote = (key) => (val) => setNotifications(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApiRequest('/api/config/settings', {
        method: 'PATCH',
        body:   JSON.stringify({ defaultRegion: general.region }),
      });
      toast.success('Settings saved successfully');
      await fetchSettings();
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Security, notifications & platform defaults"
        action={
          <button
            onClick={handleSave}
            disabled={saving}
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

      <div className="grid grid-cols-2 gap-5 items-start">

        <div className="space-y-5">
          <SettingCard icon="FiShield" title="Security">
            <ToggleRow
              title="Require 2FA"
              description="Enforce two-factor auth on all staff accounts"
              checked={security.require2fa}
              onChange={setSec('require2fa')}
            />
            <ToggleRow
              title="Enforce strong passwords"
              description="Minimum 12 chars, symbols & numbers"
              checked={security.strongPasswords}
              onChange={setSec('strongPasswords')}
            />
            <SelectRow
              title="Session timeout"
              description="Auto sign-out after inactivity"
              value={security.sessionTimeout}
              onChange={setSec('sessionTimeout')}
              options={TIMEOUT_OPTIONS}
            />
          </SettingCard>

          <SettingCard icon="FiGlobe" title="General">
            <SelectRow
              title="Default region"
              description="Applied to new reports & users"
              value={general.region}
              onChange={setGen('region')}
              options={regionOptions}
            />
            <SelectRow
              title="Timezone"
              description="Used for logs & timestamps"
              value={general.timezone}
              onChange={setGen('timezone')}
              options={TIMEZONE_OPTIONS}
            />
            <SelectRow
              title="Currency"
              description="Reporting & impact valuation"
              value={general.currency}
              onChange={setGen('currency')}
              options={CURRENCY_OPTIONS}
            />
          </SettingCard>
        </div>

        <div className="space-y-5">
          <SettingCard icon="FiBell" title="Notifications">
            <ToggleRow
              title="Email alerts"
              description="Data-integrity & security events"
              checked={notifications.emailAlerts}
              onChange={setNote('emailAlerts')}
            />
            <ToggleRow
              title="Weekly digest"
              description="Summary of published reports"
              checked={notifications.weeklyDigest}
              onChange={setNote('weeklyDigest')}
            />
            <ToggleRow
              title="Failed-login warnings"
              description="Notify on repeated failed logins"
              checked={notifications.failedLoginWarnings}
              onChange={setNote('failedLoginWarnings')}
            />
          </SettingCard>

          <SettingCard icon="FiAlertTriangle" title="Danger Zone" danger>
            <ActionRow
              title="Export all data"
              description="Download a full encrypted archive"
              label="Export"
            />
            <ActionRow
              title="Purge audit logs"
              description="Permanently delete logs older than 1 year"
              label="Purge"
              danger
            />
          </SettingCard>
        </div>

      </div>
    </div>
  );
};

export default Settings;
