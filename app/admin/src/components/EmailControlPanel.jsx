import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Shield,
  Clock,
  Users
} from 'lucide-react';

// ============================================
// EMAIL CONTROL PANEL COMPONENT
// แผงควบคุมระบบส่งอีเมลสำหรับ Admin
// ============================================

const EmailControlPanel = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyAction, setEmergencyAction] = useState('disable_all');

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
        toast.error('Failed to load email settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ============================================
  // SETTING UPDATE FUNCTIONS
  // ============================================

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
          reason: reason || `Changed via admin panel`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Setting updated: ${settingKey}`);
        await fetchSettings(); // Refresh data
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

  const handleEmergencyToggle = async () => {
    if (!emergencyReason.trim() || emergencyReason.length < 5) {
      alert('Please provide a reason (at least 5 characters)');
      return;
    }

    try {
      setUpdating('emergency');
      
      const response = await fetch('/api/v1/admin/email-settings/emergency-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: emergencyAction,
          reason: emergencyReason
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Emergency ${emergencyAction} completed`);
        setShowEmergencyDialog(false);
        setEmergencyReason('');
        await fetchSettings();
      } else {
        alert(`Emergency toggle failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error in emergency toggle:', error);
      alert('Emergency toggle failed');
    } finally {
      setUpdating(null);
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderSettingRow = (setting) => {
    const isUpdating = updating === setting.setting_key;
    
    return (
      <div 
        key={setting.setting_id} 
        className="flex items-center justify-between p-4 border rounded-lg bg-white"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{setting.setting_key}</h4>
            <span 
              className={`px-2 py-1 text-xs rounded ${
                setting.setting_value 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {setting.setting_value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{setting.description}</p>
          {setting.updated_by_name && (
            <p className="text-xs text-gray-500">
              Last updated by {setting.updated_by_name} at {new Date(setting.updated_at).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.setting_value}
              disabled={isUpdating}
              onChange={(e) => updateSetting(setting.setting_key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
        </div>
      </div>
    );
  };

  const renderSystemStatus = () => {
    if (!settings?.systemStatus) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {settings.systemStatus.map((status) => (
          <Card key={status.component}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{status.component.replace('_', ' ')}</h4>
                {status.is_enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <Badge 
                variant={status.status === 'ACTIVE' ? 'success' : 'destructive'}
                className="mb-2"
              >
                {status.status}
              </Badge>
              
              {status.error_message && (
                <p className="text-xs text-red-600 mt-1">{status.error_message}</p>
              )}
              
              {status.last_health_check && (
                <p className="text-xs text-gray-500 mt-1">
                  Last check: {new Date(status.last_health_check).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading email settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load email settings. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Email Control Panel
          </h1>
          <p className="text-gray-600">Manage email system settings and controls</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={fetchSettings}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Shield className="w-4 h-4 mr-2" />
                Emergency Control
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Emergency Email System Control
                </DialogTitle>
                <DialogDescription>
                  This will immediately disable or enable all email sending functions. 
                  Use this only in emergency situations.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Action</label>
                  <select 
                    value={emergencyAction}
                    onChange={(e) => setEmergencyAction(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="disable_all">Disable All Email Services</option>
                    <option value="enable_all">Enable All Email Services</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason (Required)</label>
                  <Textarea
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="Please provide a detailed reason for this emergency action..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={() => setShowEmergencyDialog(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmergencyToggle}
                  variant="destructive"
                  disabled={updating === 'emergency' || emergencyReason.length < 5}
                >
                  {updating === 'emergency' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Execute Emergency Action
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderSystemStatus()}
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTab value="system">System Settings</TabsTab>
          <TabsTab value="email-types">Email Types</TabsTab>
          <TabsTab value="audit">Audit Log</TabsTab>
        </TabsList>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System-wide Email Settings</CardTitle>
              <p className="text-sm text-gray-600">
                These settings affect the entire email system
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.settings.system.map(renderSettingRow)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email-types" className="space-y-4">
          {Object.entries(settings.settings.emailTypes).map(([emailType, typeSettings]) => (
            <Card key={emailType}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {emailType.replace('_', ' ')} Email Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typeSettings.map(renderSettingRow)}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Settings Change History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Audit log functionality will be implemented here to track all setting changes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailControlPanel;
