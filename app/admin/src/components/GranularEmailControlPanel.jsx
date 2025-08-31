import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Clock,
  Users,
  CreditCard,
  MapPin,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// ============================================
// GRANULAR EMAIL CONTROL PANEL
// แผงควบคุมอีเมลแบบละเอียด (Granular Control)
// ============================================

const GranularEmailControlPanel = () => {
  const [settings, setSettings] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    checkinReminder: true,
    paymentReceipt: false,
    bookingConfirmation: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/email-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        alert('Failed to load email settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (settingKey, newValue, reason) => {
    try {
      setUpdating(settingKey);
      
      const response = await fetch(`/api/v1/admin/email-settings/${settingKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settingValue: newValue,
          reason: reason || `Changed via granular control panel`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Setting updated: ${settingKey}`);
        await fetchSettings();
      } else {
        alert(`Failed to update setting: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Error updating setting');
    } finally {
      setUpdating(null);
    }
  };

  // ============================================
  // RENDER COMPONENTS
  // ============================================

  const ToggleSwitch = ({ checked, disabled, onChange, label, description, settingKey }) => {
    const isUpdating = updating === settingKey;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{label}</span>
            <span 
              className={`px-2 py-1 text-xs rounded ${
                checked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {checked ? 'ON' : 'OFF'}
            </span>
          </div>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled || isUpdating}
              onChange={(e) => onChange(settingKey, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          {isUpdating && <RefreshCw className="w-3 h-3 animate-spin" />}
        </div>
      </div>
    );
  };

  const ExpandableSection = ({ title, icon: Icon, expanded, onToggle, children, status }) => (
    <div className="border rounded-lg bg-white">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">{title}</h3>
          <span 
            className={`px-2 py-1 text-xs rounded ${
              status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {status ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
      
      {expanded && (
        <div className="p-4 border-t bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );

  // ============================================
  // SECTION RENDERERS
  // ============================================

  const renderCheckinReminderSection = () => {
    const checkinSettings = settings?.settings?.emailTypes?.checkin_reminder || [];
    
    // จัดกลุ่ม settings
    const mainSetting = checkinSettings.find(s => s.setting_key === 'checkin_reminder_enabled');
    const timingSettings = checkinSettings.filter(s => s.setting_key.includes('_24h_') || s.setting_key.includes('_3h_') || s.setting_key.includes('_1h_'));
    const guestTypeSettings = checkinSettings.filter(s => s.setting_key.includes('_vip_') || s.setting_key.includes('_regular_'));
    const channelSettings = checkinSettings.filter(s => s.setting_key.includes('_online_') || s.setting_key.includes('_walk_in_'));
    const roomTypeSettings = checkinSettings.filter(s => s.setting_key.includes('_suite_') || s.setting_key.includes('_standard_'));

    return (
      <ExpandableSection
        title="Check-in Reminder Controls"
        icon={Clock}
        expanded={expandedSections.checkinReminder}
        onToggle={() => setExpandedSections(prev => ({
          ...prev,
          checkinReminder: !prev.checkinReminder
        }))}
        status={mainSetting?.setting_value}
      >
        <div className="space-y-6">
          {/* Main Control */}
          {mainSetting && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Master Control
              </h4>
              <ToggleSwitch
                checked={mainSetting.setting_value}
                onChange={updateSetting}
                settingKey={mainSetting.setting_key}
                label="Check-in Reminder System"
                description="Enable/disable all check-in reminder emails"
              />
            </div>
          )}

          {/* Timing Controls */}
          {timingSettings.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timing Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {timingSettings.map(setting => (
                  <ToggleSwitch
                    key={setting.setting_id}
                    checked={setting.setting_value}
                    onChange={updateSetting}
                    settingKey={setting.setting_key}
                    label={setting.setting_key.includes('24h') ? '24 Hours Before' : 
                           setting.setting_key.includes('3h') ? '3 Hours Before' : '1 Hour Before'}
                    description={setting.description}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Guest Type Controls */}
          {guestTypeSettings.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guest Type Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guestTypeSettings.map(setting => (
                  <ToggleSwitch
                    key={setting.setting_id}
                    checked={setting.setting_value}
                    onChange={updateSetting}
                    settingKey={setting.setting_key}
                    label={setting.setting_key.includes('vip') ? 'VIP Guests' : 'Regular Guests'}
                    description={setting.description}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Booking Channel Controls */}
          {channelSettings.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Booking Channel Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {channelSettings.map(setting => (
                  <ToggleSwitch
                    key={setting.setting_id}
                    checked={setting.setting_value}
                    onChange={updateSetting}
                    settingKey={setting.setting_key}
                    label={setting.setting_key.includes('online') ? 'Online Bookings' : 'Walk-in Guests'}
                    description={setting.description}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Room Type Controls */}
          {roomTypeSettings.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Room Type Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roomTypeSettings.map(setting => (
                  <ToggleSwitch
                    key={setting.setting_id}
                    checked={setting.setting_value}
                    onChange={updateSetting}
                    settingKey={setting.setting_key}
                    label={setting.setting_key.includes('suite') ? 'Suite Rooms' : 'Standard Rooms'}
                    description={setting.description}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ExpandableSection>
    );
  };

  const renderQuickActions = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="font-semibold text-yellow-800 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => {
            if (confirm('Disable only check-in reminders? Other emails will continue working.')) {
              updateSetting('checkin_reminder_enabled', false, 'Quick disable check-in reminders only');
            }
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
        >
          🚫 Disable Check-in Only
        </button>
        
        <button
          onClick={() => {
            if (confirm('Disable only 24h reminders? 3h and 1h reminders will still work.')) {
              updateSetting('checkin_reminder_24h_enabled', false, 'Disable 24h reminders only');
            }
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
        >
          ⏰ Disable 24h Reminders
        </button>
        
        <button
          onClick={() => {
            if (confirm('Disable reminders for regular guests only? VIP reminders will continue.')) {
              updateSetting('checkin_reminder_regular_enabled', false, 'Disable regular guest reminders');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          👥 Disable Regular Guest Reminders
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading granular email settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-red-800">Failed to load email settings. Please refresh the page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Granular Email Control Panel
          </h1>
          <p className="text-gray-600">Fine-grained control over email sending - disable specific types, timings, or guest segments</p>
        </div>
        
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Example Scenarios */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Example Use Cases</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>High bounce rate on 24h reminders?</strong> → Disable only "24 Hours Before" timing</p>
          <p>• <strong>VIP guests complaining?</strong> → Disable only "VIP Guest" reminders</p>
          <p>• <strong>Walk-in guests confused?</strong> → Disable only "Walk-in Guest" reminders</p>
          <p>• <strong>Suite guests prefer phone calls?</strong> → Disable only "Suite Room" reminders</p>
        </div>
      </div>

      {/* Granular Controls */}
      <div className="space-y-4">
        {renderCheckinReminderSection()}
        
        {/* Add other email types here */}
        <ExpandableSection
          title="Payment Receipt Controls"
          icon={CreditCard}
          expanded={expandedSections.paymentReceipt}
          onToggle={() => setExpandedSections(prev => ({
            ...prev,
            paymentReceipt: !prev.paymentReceipt
          }))}
          status={true}
        >
          <p className="text-gray-600">Payment receipt granular controls will be implemented here...</p>
        </ExpandableSection>

        <ExpandableSection
          title="Booking Confirmation Controls"
          icon={CheckCircle}
          expanded={expandedSections.bookingConfirmation}
          onToggle={() => setExpandedSections(prev => ({
            ...prev,
            bookingConfirmation: !prev.bookingConfirmation
          }))}
          status={true}
        >
          <p className="text-gray-600">Booking confirmation granular controls will be implemented here...</p>
        </ExpandableSection>
      </div>

      {/* Status Summary */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Current Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Check-in Reminders:</span>
            <div className="mt-1">
              {settings?.settings?.emailTypes?.checkin_reminder?.filter(s => s.setting_value).length || 0} enabled, {' '}
              {settings?.settings?.emailTypes?.checkin_reminder?.filter(s => !s.setting_value).length || 0} disabled
            </div>
          </div>
          <div>
            <span className="font-medium">Payment Receipts:</span>
            <div className="mt-1">
              {settings?.settings?.emailTypes?.payment_receipt?.filter(s => s.setting_value).length || 0} enabled
            </div>
          </div>
          <div>
            <span className="font-medium">Booking Confirmations:</span>
            <div className="mt-1">
              {settings?.settings?.emailTypes?.booking_confirmation?.filter(s => s.setting_value).length || 0} enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GranularEmailControlPanel;
