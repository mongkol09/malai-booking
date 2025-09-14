import React, { useState, useEffect } from 'react';
import './ArchiveSettingsPanel.css';

const ArchiveSettingsPanel = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch archive configurations
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/archive-config', {
        headers: {
          'X-API-Key': process.env.REACT_APP_API_KEY,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch archive configurations');
      }
      
      const data = await response.json();
      setConfigs(data.data.configs);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching configs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update configuration
  const updateConfig = async (configId, updates) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/v1/archive-config/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update configuration');
      }

      await fetchConfigs(); // Refresh list
    } catch (err) {
      setError(err.message);
      console.error('Error updating config:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle hide from active list
  const toggleHideFromActiveList = (config) => {
    updateConfig(config.id, {
      ...config,
      hideFromActiveList: !config.hideFromActiveList,
    });
  };

  // Toggle auto archive
  const toggleAutoArchive = (config) => {
    updateConfig(config.id, {
      ...config,
      autoArchiveEnabled: !config.autoArchiveEnabled,
    });
  };

  // Update archive days
  const updateArchiveDays = (config, days) => {
    const numDays = parseInt(days) || 0;
    if (numDays !== config.archiveAfterDays) {
      updateConfig(config.id, {
        ...config,
        archiveAfterDays: numDays,
      });
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Cancelled': 'status-cancelled',
      'NoShow': 'status-noshow',
      'CheckedOut': 'status-checkedout',
      'Completed': 'status-completed',
    };
    return colors[status] || 'status-default';
  };

  if (loading) {
    return (
      <div className="archive-settings-panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Loading archive settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="archive-settings-panel">
      {/* Header */}
      <div className="panel-header">
        <h2>📁 Archive Management Settings</h2>
        <p>Configure how booking statuses are handled for archiving and display</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="error-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Archive Rules */}
      <div className="configs-grid">
        {configs.map((config) => (
          <div key={config.id} className="config-card">
            
            {/* Status Badge */}
            <div className="config-header">
              <span className={`status-badge ${getStatusColor(config.status)}`}>
                {config.status}
              </span>
              <span className={`active-badge ${config.isActive ? 'active' : 'inactive'}`}>
                {config.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Description */}
            <p className="config-description">{config.description}</p>

            {/* Controls Grid */}
            <div className="controls-grid">
              
              {/* Hide from Active List */}
              <div className="control-group">
                <label className="control-label">
                  {config.hideFromActiveList ? '🙈' : '👁️'} Hide from Active List
                </label>
                <div className="switch-container">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.hideFromActiveList}
                      onChange={() => toggleHideFromActiveList(config)}
                      disabled={saving}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="control-help">
                  {config.hideFromActiveList 
                    ? 'Hidden from admin booking list' 
                    : 'Visible in admin booking list'
                  }
                </p>
              </div>

              {/* Archive After Days */}
              <div className="control-group">
                <label className="control-label">
                  ⏰ Archive After (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={config.archiveAfterDays}
                  onChange={(e) => updateArchiveDays(config, e.target.value)}
                  disabled={saving}
                  className="number-input"
                />
                <p className="control-help">
                  Auto-archive after this many days
                </p>
              </div>

              {/* Auto Archive Toggle */}
              <div className="control-group">
                <label className="control-label">
                  ⚙️ Auto Archive
                </label>
                <div className="switch-container">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.autoArchiveEnabled}
                      onChange={() => toggleAutoArchive(config)}
                      disabled={saving}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="control-help">
                  {config.autoArchiveEnabled 
                    ? 'Automatically archive' 
                    : 'Manual archive only'
                  }
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <div className="info-panel">
        <div className="info-section">
          <h3>📖 How Archive Settings Work</h3>
          <ul>
            <li><strong>Hide from Active List</strong>: Removes bookings from admin view immediately</li>
            <li><strong>Archive After Days</strong>: Moves bookings to archive storage after specified time</li>
            <li><strong>Auto Archive</strong>: Automatically processes archive rules daily</li>
          </ul>
        </div>
        <div className="info-section">
          <h3>📊 Current Status</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span>Active Configurations:</span>
              <span className="stat-value">{configs.filter(c => c.isActive).length}</span>
            </div>
            <div className="stat-item">
              <span>Auto-Archive Enabled:</span>
              <span className="stat-value">{configs.filter(c => c.autoArchiveEnabled).length}</span>
            </div>
            <div className="stat-item">
              <span>Hidden Statuses:</span>
              <span className="stat-value">{configs.filter(c => c.hideFromActiveList).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions-panel">
        <button 
          onClick={fetchConfigs} 
          disabled={loading || saving}
          className="btn btn-primary"
        >
          {loading ? 'Loading...' : 'Refresh Settings'}
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-secondary"
          disabled={saving}
        >
          Reset Changes
        </button>
      </div>

      {/* Loading Overlay */}
      {saving && (
        <div className="saving-overlay">
          <div className="saving-spinner"></div>
          <span>Saving changes...</span>
        </div>
      )}
    </div>
  );
};

export default ArchiveSettingsPanel;