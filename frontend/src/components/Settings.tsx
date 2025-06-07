import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Shield, Palette, Globe } from 'lucide-react';

interface SettingsData {
  general: {
    theme: string;
    language: string;
    timezone: string;
    auto_save: boolean;
  };
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    workflow_updates: boolean;
    security_alerts: boolean;
  };
  performance: {
    max_concurrent_tasks: number;
    memory_limit: number;
    cpu_cores: number;
    cache_enabled: boolean;
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number;
    api_rate_limit: number;
    audit_logging: boolean;
  };
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      auto_save: true
    },
    notifications: {
      email_enabled: true,
      push_enabled: false,
      workflow_updates: true,
      security_alerts: true
    },
    performance: {
      max_concurrent_tasks: 10,
      memory_limit: 8192,
      cpu_cores: 4,
      cache_enabled: true
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 3600,
      api_rate_limit: 1000,
      audit_logging: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your reVoAgent platform preferences</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={settings.general.theme}
                onChange={(e) => updateSetting('general', 'theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={settings.general.language}
                onChange={(e) => updateSetting('general', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.general.timezone}
                onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto-save"
                checked={settings.general.auto_save}
                onChange={(e) => updateSetting('general', 'auto_save', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto-save" className="ml-2 block text-sm text-gray-900">
                Enable auto-save
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email-notifications"
                checked={settings.notifications.email_enabled}
                onChange={(e) => updateSetting('notifications', 'email_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
                Email notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="push-notifications"
                checked={settings.notifications.push_enabled}
                onChange={(e) => updateSetting('notifications', 'push_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-900">
                Push notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="workflow-updates"
                checked={settings.notifications.workflow_updates}
                onChange={(e) => updateSetting('notifications', 'workflow_updates', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="workflow-updates" className="ml-2 block text-sm text-gray-900">
                Workflow updates
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="security-alerts"
                checked={settings.notifications.security_alerts}
                onChange={(e) => updateSetting('notifications', 'security_alerts', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="security-alerts" className="ml-2 block text-sm text-gray-900">
                Security alerts
              </label>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Performance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Concurrent Tasks
              </label>
              <input
                type="number"
                value={settings.performance.max_concurrent_tasks}
                onChange={(e) => updateSetting('performance', 'max_concurrent_tasks', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory Limit (MB)
              </label>
              <input
                type="number"
                value={settings.performance.memory_limit}
                onChange={(e) => updateSetting('performance', 'memory_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1024"
                max="32768"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPU Cores
              </label>
              <input
                type="number"
                value={settings.performance.cpu_cores}
                onChange={(e) => updateSetting('performance', 'cpu_cores', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="16"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cache-enabled"
                checked={settings.performance.cache_enabled}
                onChange={(e) => updateSetting('performance', 'cache_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="cache-enabled" className="ml-2 block text-sm text-gray-900">
                Enable caching
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="two-factor"
                checked={settings.security.two_factor_enabled}
                onChange={(e) => updateSetting('security', 'two_factor_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                Two-factor authentication
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (seconds)
              </label>
              <input
                type="number"
                value={settings.security.session_timeout}
                onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="300"
                max="86400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Rate Limit (requests/hour)
              </label>
              <input
                type="number"
                value={settings.security.api_rate_limit}
                onChange={(e) => updateSetting('security', 'api_rate_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                max="10000"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="audit-logging"
                checked={settings.security.audit_logging}
                onChange={(e) => updateSetting('security', 'audit_logging', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="audit-logging" className="ml-2 block text-sm text-gray-900">
                Enable audit logging
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;