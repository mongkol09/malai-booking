import React, { useState, useEffect } from 'react'
import { useRoles } from '../../../hooks/usePermissions'
import PermissionGate, { PermissionButton } from '../../../components/PermissionGate'
import rolePermissionService from '../../../services/rolePermissionService'

const RolePermission = () => {
  const { roles, permissions, loading, error, createRole, updateRole, deleteRole, updateRolePermissions, refreshData } = useRoles();
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [rolePermissions, setRolePermissions] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Available resources และ actions
  const availableResources = rolePermissionService.getAvailableResources();
  const availableActions = rolePermissionService.getAvailableActions();

  // โหลดข้อมูล permissions ของ role ที่เลือก
  useEffect(() => {
    if (selectedRole) {
      const rolePerms = {};
      if (selectedRole.permissions) {
        selectedRole.permissions.forEach(perm => {
          rolePerms[perm.resourceName] = {
            canRead: perm.canRead,
            canWrite: perm.canWrite,
            canCreate: perm.canCreate,
            canDelete: perm.canDelete
          };
        });
      }
      setRolePermissions(rolePerms);
      setFormData({
        name: selectedRole.name,
        description: selectedRole.description || ''
      });
      setIsEditing(true);
    } else {
      setRolePermissions({});
      setFormData({ name: '', description: '' });
      setIsEditing(false);
    }
  }, [selectedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setMessage({ type: '', text: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (resource, action, checked) => {
    setRolePermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [`can${action.charAt(0).toUpperCase() + action.slice(1)}`]: checked
      }
    }));
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'กรุณาระบุชื่อ Role' });
      return;
    }

    try {
      setMessage({ type: '', text: '' });
      
      // เตรียมข้อมูล permissions
      const permissionsData = [];
      Object.keys(rolePermissions).forEach(resource => {
        const perms = rolePermissions[resource];
        if (perms.canRead || perms.canWrite || perms.canCreate || perms.canDelete) {
          permissionsData.push({
            resourceName: resource,
            canRead: perms.canRead || false,
            canWrite: perms.canWrite || false,
            canCreate: perms.canCreate || false,
            canDelete: perms.canDelete || false
          });
        }
      });

      if (isEditing && selectedRole) {
        // อัพเดท role
        await updateRole(selectedRole.id, {
          name: formData.name,
          description: formData.description
        });
        
        // อัพเดท permissions
        await updateRolePermissions(selectedRole.id, permissionsData);
        
        setMessage({ type: 'success', text: 'อัพเดท Role สำเร็จ' });
      } else {
        // สร้าง role ใหม่
        const newRole = await createRole({
          name: formData.name,
          description: formData.description,
          permissions: permissionsData
        });
        
        setMessage({ type: 'success', text: 'สร้าง Role สำเร็จ' });
        setSelectedRole(newRole);
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'เกิดข้อผิดพลาด' });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole || !window.confirm(`คุณต้องการลบ Role "${selectedRole.name}" หรือไม่?`)) {
      return;
    }

    try {
      await deleteRole(selectedRole.id);
      setSelectedRole(null);
      setMessage({ type: 'success', text: 'ลบ Role สำเร็จ' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'เกิดข้อผิดพลาดในการลบ Role' });
    }
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <PermissionGate resource="roles" action="read" fallback={
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="alert alert-warning">
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
        </div>
      </div>
    }>
      <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
        <div className="row g-3">
          <div className="col-sm-12">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <h3 className="fw-bold mb-0">Role Permission Management</h3>
              <PermissionButton 
                resource="roles" 
                action="create"
                className="btn btn-primary"
                onClick={handleNewRole}
              >
                <i className="bi bi-plus-lg me-2"></i>New Role
              </PermissionButton>
            </div>
          </div>

          {/* Role Selection */}
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Select Role</h5>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {roles.map(role => (
                    <div key={role.id} className="col-md-3">
                      <button
                        className={`btn w-100 ${selectedRole?.id === role.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleRoleSelect(role)}
                      >
                        {role.name}
                        <small className="d-block text-muted">{role.description}</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Role Form */}
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  {isEditing ? `Edit Role: ${selectedRole?.name}` : 'Create New Role'}
                </h5>
              </div>
              <div className="card-body">
                {/* Display message */}
                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                  </div>
                )}

                <form onSubmit={handleSaveRole}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label text-muted">Role Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          placeholder="Role Name"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label text-muted">Description</label>
                        <textarea 
                          className="form-control"
                          placeholder="Role Description"
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                    </div>

                    {/* Permissions Table */}
                    <div className="col-md-12">
                      <h5 className="theme-text-color2 mb-3">Resource Permissions</h5>
                      <div className="table-responsive">
                        <table className="table table-striped custom-table mb-0">
                          <thead>
                            <tr>
                              <th>Resource</th>
                              <th className="text-center">Read</th>
                              <th className="text-center">Write</th>
                              <th className="text-center">Create</th>
                              <th className="text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableResources.map((resource) => {
                              const perms = rolePermissions[resource] || {};
                              return (
                                <tr key={resource}>
                                  <td className="fw-bold text-capitalize">{resource}</td>
                                  <td className="text-center">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={perms.canRead || false}
                                      onChange={(e) => handlePermissionChange(resource, 'read', e.target.checked)}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={perms.canWrite || false}
                                      onChange={(e) => handlePermissionChange(resource, 'write', e.target.checked)}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={perms.canCreate || false}
                                      onChange={(e) => handlePermissionChange(resource, 'create', e.target.checked)}
                                    />
                                  </td>
                                  <td className="text-center">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={perms.canDelete || false}
                                      onChange={(e) => handlePermissionChange(resource, 'delete', e.target.checked)}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-12">
                      <div className="d-flex gap-2">
                        <PermissionButton 
                          resource="roles" 
                          action={isEditing ? "write" : "create"}
                          type="submit"
                          className="btn btn-success"
                        >
                          <i className="bi bi-check-lg me-2"></i>
                          {isEditing ? 'Update Role' : 'Create Role'}
                        </PermissionButton>
                        
                        {isEditing && (
                          <PermissionButton 
                            resource="roles" 
                            action="delete"
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDeleteRole}
                          >
                            <i className="bi bi-trash me-2"></i>Delete Role
                          </PermissionButton>
                        )}
                        
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleNewRole}
                        >
                          <i className="bi bi-x-lg me-2"></i>Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default RolePermission;
