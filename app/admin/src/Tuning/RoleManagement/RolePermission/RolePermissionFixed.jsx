import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

// Simple Permission Gate Component
const PermissionGate = ({ resource, action, children, fallback = null }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const user = authService.getUser();
        if (!user || !user.staffProfile) {
          setHasPermission(false);
          setLoading(false);
          return;
        }

        // For now, allow access for all authenticated staff
        // Later we can implement detailed permission checking
        setHasPermission(true);
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [resource, action]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return hasPermission ? children : fallback;
};

const RolePermission = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resources = [
    { name: 'users', label: 'User Management' },
    { name: 'roles', label: 'Role Management' },
    { name: 'bookings', label: 'Booking Management' },
    { name: 'reports', label: 'Reports & Analytics' },
    { name: 'settings', label: 'System Settings' }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await authService.request('/role-permissions/roles');
      if (response.success) {
        setRoles(response.data || []);
      } else {
        setError('Failed to load roles');
        setRoles([]); // Ensure roles is always an array
      }
    } catch (error) {
      setError('Failed to load roles: ' + error.message);
      setRoles([]); // Ensure roles is always an array
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId) => {
    try {
      const response = await authService.request(`/role-permissions/roles/${roleId}/permissions`);
      if (response.success) {
        const perms = {};
        if (response.data && response.data.permissions) {
          Object.keys(response.data.permissions).forEach(resourceName => {
            const perm = response.data.permissions[resourceName];
            perms[resourceName] = {
              read: perm.canRead || false,
              write: perm.canWrite || false,
              create: perm.canCreate || false,
              delete: perm.canDelete || false
            };
          });
        }
        setPermissions(perms);
      }
    } catch (error) {
      setError('Failed to load permissions: ' + error.message);
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    const role = Array.isArray(roles) ? roles.find(r => r.id === roleId) : null;
    if (role) {
      loadRolePermissions(roleId);
    } else {
      setPermissions({});
    }
  };

  const handlePermissionChange = (resource, action, value) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: value
      }
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      // Convert permissions to API format
      const permissionsArray = Object.keys(permissions).map(resourceName => ({
        resourceName,
        canRead: permissions[resourceName]?.read || false,
        canWrite: permissions[resourceName]?.write || false,
        canCreate: permissions[resourceName]?.create || false,
        canDelete: permissions[resourceName]?.delete || false
      }));

      const response = await authService.request(`/role-permissions/roles/${selectedRole}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: permissionsArray })
      });

      if (response.success) {
        setSuccessMessage('Permissions updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to update permissions');
      }
    } catch (error) {
      setError('Failed to save permissions: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderPermissionCheckbox = (resource, action) => {
    const isChecked = permissions[resource]?.[action] || false;
    
    return (
      <input
        type="checkbox"
        className="form-check-input"
        checked={isChecked}
        onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
        disabled={saving}
      />
    );
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate resource="roles" action="read" 
      fallback={
        <div className="container-fluid p-4">
          <div className="alert alert-warning">
            <h4>Access Denied</h4>
            <p>You don't have permission to view role permissions.</p>
          </div>
        </div>
      }
    >
      <div className="container-fluid p-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-primary mb-1">Role Permissions Management</h2>
                <p className="text-muted mb-0">Configure permissions for different roles</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                {successMessage}
                <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
              </div>
            )}

            <div className="card">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label text-muted">
                        Select Role <span className="text-danger">*</span>
                      </label>
                      <select 
                        className="form-control form-control-lg"
                        value={selectedRole}
                        onChange={(e) => handleRoleSelect(e.target.value)}
                      >
                        <option value="">-- Select Role --</option>
                        {Array.isArray(roles) && roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {selectedRole && (
                  <div className="mt-4">
                    <h5 className="mb-3">Permissions</h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Resource</th>
                            <th className="text-center">Read</th>
                            <th className="text-center">Write</th>
                            <th className="text-center">Create</th>
                            <th className="text-center">Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.map(resource => (
                            <tr key={resource.name}>
                              <td>
                                <strong>{resource.label}</strong>
                                <br />
                                <small className="text-muted">{resource.name}</small>
                              </td>
                              <td className="text-center">
                                {renderPermissionCheckbox(resource.name, 'read')}
                              </td>
                              <td className="text-center">
                                {renderPermissionCheckbox(resource.name, 'write')}
                              </td>
                              <td className="text-center">
                                {renderPermissionCheckbox(resource.name, 'create')}
                              </td>
                              <td className="text-center">
                                {renderPermissionCheckbox(resource.name, 'delete')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleSavePermissions}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Permissions
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default RolePermission;
