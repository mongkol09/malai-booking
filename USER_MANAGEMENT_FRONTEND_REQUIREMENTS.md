# User Management Frontend Requirements 👥

## 📁 **ต้องสร้าง Directory Structure**

```
D:\Hotel_booking\app\admin\src\Tuning\UserManagement\
├── UserList/
│   ├── UserList.jsx
│   └── Components/
│       ├── UserListTable.jsx
│       ├── UserCard.jsx
│       └── UserFilters.jsx
├── UserCreate/
│   ├── UserCreate.jsx
│   └── Components/
│       ├── UserForm.jsx
│       └── UserValidation.js
├── UserProfile/
│   ├── UserProfile.jsx
│   └── Components/
│       ├── ProfileDetails.jsx
│       ├── ProfileEdit.jsx
│       └── ProfileSettings.jsx
├── UserEdit/
│   ├── UserEdit.jsx
│   └── Components/
│       ├── EditUserForm.jsx
│       └── UserStatusToggle.jsx
└── Components/
    ├── UserAvatar.jsx
    ├── UserStatusBadge.jsx
    └── UserRoleSelector.jsx
```

## 🔗 **Routes ที่ต้องเพิ่ม (Routes.jsx)**

```jsx
// User Management Routes
<Route exact path="/users" element={<UserList/>} />
<Route exact path="/users/create" element={<UserCreate/>} />
<Route exact path="/users/:id" element={<UserProfile/>} />
<Route exact path="/users/:id/edit" element={<UserEdit/>} />
<Route exact path="/my-profile" element={<MyProfile/>} />
```

## 🎨 **Components ที่ต้องสร้าง**

### 1. **UserList.jsx** (หลัก)
- แสดงรายการผู้ใช้ทั้งหมด
- ฟิลเตอร์ตาม role, status, created date
- Search ด้วย name, email
- Pagination
- Bulk actions (activate/deactivate)

### 2. **UserCreate.jsx** (สร้างผู้ใช้ใหม่)
- Form สร้าง user ใหม่
- เลือก role
- ตั้งรหัสผ่านเริ่มต้น
- Upload avatar
- Email verification option

### 3. **UserProfile.jsx** (ดูข้อมูลผู้ใช้)
- ข้อมูลส่วนตัว
- Role และ permissions
- Login history
- Activity logs
- Settings

### 4. **UserEdit.jsx** (แก้ไขผู้ใช้)
- แก้ไขข้อมูลผู้ใช้
- เปลี่ยน role
- Reset password
- Enable/disable account
- Update profile

### 5. **MyProfile.jsx** (โปรไฟล์ตัวเอง)
- ดูข้อมูลส่วนตัว
- แก้ไขข้อมูล
- เปลี่ยนรหัสผ่าน
- Two-factor authentication

## 📊 **API Integration Points**

### **Backend APIs ที่ต้องสร้าง/ปรับปรุง:**

```typescript
// User CRUD Operations
GET    /api/v1/users                    // List all users (with filters)
POST   /api/v1/users                    // Create new user
GET    /api/v1/users/:id                // Get user by ID
PUT    /api/v1/users/:id                // Update user
DELETE /api/v1/users/:id                // Delete user
PUT    /api/v1/users/:id/status         // Change user status
PUT    /api/v1/users/:id/role           // Change user role
POST   /api/v1/users/:id/reset-password // Reset user password

// Profile Management
GET    /api/v1/users/me                 // Current user profile ✅ มีแล้ว (ต้องแก้)
PUT    /api/v1/users/me                 // Update profile ✅ มีแล้ว (ต้องแก้)
PUT    /api/v1/users/me/password        // Change password
POST   /api/v1/users/me/avatar          // Upload avatar

// User Analytics
GET    /api/v1/users/stats              // User statistics
GET    /api/v1/users/:id/activity       // User activity logs
GET    /api/v1/users/:id/sessions       // User login sessions
```

### **Frontend API Service ที่ต้องเพิ่ม (apiService.js):**

```javascript
// User Management API calls
const userAPI = {
  // User CRUD
  getUsers: (filters) => api.get('/users', { params: filters }),
  createUser: (userData) => api.post('/users', userData),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // User Status & Role
  changeUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  changeUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  resetUserPassword: (id) => api.post(`/users/${id}/reset-password`),
  
  // Profile Management
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data) => api.put('/users/me', data),
  changeMyPassword: (data) => api.put('/users/me/password', data),
  uploadAvatar: (file) => api.post('/users/me/avatar', file),
  
  // Analytics
  getUserStats: () => api.get('/users/stats'),
  getUserActivity: (id) => api.get(`/users/${id}/activity`),
  getUserSessions: (id) => api.get(`/users/${id}/sessions`)
};
```

## 🎯 **Priority การพัฒนา**

### **Phase 1: Basic User Management**
1. **แก้ไข Backend APIs** - เชื่อมฐานข้อมูลจริง
2. **สร้าง UserList** - แสดงรายการผู้ใช้
3. **สร้าง UserCreate** - เพิ่มผู้ใช้ใหม่
4. **เพิ่ม Routes** - เชื่อมต่อหน้าต่างๆ

### **Phase 2: User Profile & Edit**
1. **สร้าง UserProfile** - ดูข้อมูลผู้ใช้
2. **สร้าง UserEdit** - แก้ไขผู้ใช้
3. **สร้าง MyProfile** - โปรไฟล์ตัวเอง
4. **Role Integration** - เชื่อมต่อกับ RoleManagement

### **Phase 3: Advanced Features**
1. **User Activity Logs** - ประวัติการใช้งาน
2. **Bulk Operations** - การดำเนินการหลายคน
3. **Advanced Filters** - ฟิลเตอร์ขั้นสูง
4. **User Analytics** - สถิติผู้ใช้

## 📱 **Navigation Menu ที่ต้องเพิ่ม**

```jsx
// ใน Sidebar/Navigation
<li className="nav-item">
  <Link className="nav-link" to="/users">
    <i className="fa fa-users"></i>
    <span>User Management</span>
  </Link>
  <ul className="nav nav-second-level">
    <li><Link to="/users">All Users</Link></li>
    <li><Link to="/users/create">Add User</Link></li>
    <li><Link to="/role-list">Roles</Link></li>
    <li><Link to="/role-permission">Permissions</Link></li>
  </ul>
</li>
```

## 🔄 **Integration กับระบบที่มี**

### **ใช้ Components ที่มีอยู่:**
- `AllEmployees.jsx` → template สำหรับ `UserList.jsx`
- `AddEmp.jsx` → template สำหรับ `UserCreate.jsx`
- `RoleManagement/*` → integration สำหรับ role assignment
- `CommonHeader/UserDropdown.jsx` → ใช้ user data จริง

### **ใช้ Auth System ที่มี:**
- `AuthContext.jsx` → current user data
- `authService.js` → authentication calls
- `ProtectedRoute.jsx` → role-based access control

---

## ✅ **สรุป: ต้องสร้างใหม่ 80% ของ User Management**

**มีพื้นฐาน**: Role Management, Employee templates, Auth system
**ต้องสร้าง**: User CRUD, Profile management, API integration, Navigation

**แนะนำเริ่มจาก**: แก้ไข Backend APIs ให้เชื่อมฐานข้อมูลจริง แล้วค่อยสร้าง Frontend ทีละส่วน
