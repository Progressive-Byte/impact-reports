import { useState } from 'react';
import SafeIcon from '../../../../../common/SafeIcon';
import SettingCard from './SettingCard';
import ToggleRow from './components/ToggleRow';
import SelectRow from './components/SelectRow';
import ActionRow from './components/ActionRow';

const TIMEOUT_OPTIONS = [
  { value: '15',  label: '15 minutes' },
  { value: '30',  label: '30 minutes' },
  { value: '60',  label: '1 hour' },
  { value: '120', label: '2 hours' },
];

const REGION_OPTIONS = [
  { value: 'global',         label: 'Global' },
  { value: 'mena',           label: 'MENA' },
  { value: 'eastern_europe', label: 'Eastern Europe' },
  { value: 'asia_pacific',   label: 'Asia Pacific' },
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
  const [security, setSecurity] = useState({
    require2fa:      true,
    strongPasswords: true,
    sessionTimeout:  '30',
  });

  const [general, setGeneral] = useState({
    region:   'global',
    timezone: 'utc3',
    currency: 'usd',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts:         true,
    weeklyDigest:        false,
    failedLoginWarnings: true,
  });

  const setSec  = (key) => (val) => setSecurity(p => ({ ...p, [key]: val }));
  const setGen  = (key) => (val) => setGeneral(p => ({ ...p, [key]: val }));
  const setNote = (key) => (val) => setNotifications(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">Settings</h2>
          <p className="text-sm text-gray-400 mt-0.5">Security, notifications &amp; platform defaults</p>
        </div>
        <button className="flex items-center gap-2 bg-[#E52321] hover:bg-[#c91d1b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
          <SafeIcon icon="FiSave" className="text-base" />
          Save Changes
        </button>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-5 items-start">

        {/* Left: Security + General */}
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
              options={REGION_OPTIONS}
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

        {/* Right: Notifications + Danger Zone */}
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
