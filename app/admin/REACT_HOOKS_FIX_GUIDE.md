# 🔧 React Hooks Dependencies - Manual Fix Guide

> **Priority**: 🔴 High - These can cause infinite re-renders and memory leaks
> **Total Files**: 12 files with missing dependencies

---

## 🎯 **Quick Fix Strategy**

### **Option 1: Add Missing Dependencies (Recommended)**
Add the missing functions/variables to the dependency array.

### **Option 2: Use useCallback/useMemo** 
Wrap functions in `useCallback` to stabilize references.

### **Option 3: ESLint Disable (Last Resort)**
Add `// eslint-disable-next-line react-hooks/exhaustive-deps` before the useEffect.

---

## 📝 **Files to Fix**

### **1. PaymentStatusChart.jsx** 
```javascript
// BEFORE:
useEffect(() => {
  // uses fallbackChartConfig and fallbackSummary
}, []);

// FIX:
useEffect(() => {
  // uses fallbackChartConfig and fallbackSummary
}, [fallbackChartConfig, fallbackSummary]);

// OR with useCallback:
const memoizedFallbackConfig = useMemo(() => fallbackChartConfig, []);
const memoizedFallbackSummary = useMemo(() => fallbackSummary, []);
useEffect(() => {
  // use memoized versions
}, [memoizedFallbackConfig, memoizedFallbackSummary]);
```

### **2. RevenueTrendChart.jsx**
```javascript
// FIX:
useEffect(() => {
  // uses fallbackChartConfig
}, [fallbackChartConfig]);
```

### **3. RoomOccupancyChart.jsx**
```javascript
// FIX:
useEffect(() => {
  // uses fallbackChartConfig and fallbackRoomData
}, [fallbackChartConfig, fallbackRoomData]);
```

### **4. RoomBooking.jsx** (2 effects)
```javascript
// Effect 1:
useEffect(() => {
  loadAvailableRooms();
}, [loadAvailableRooms]);

// Effect 2:
useEffect(() => {
  calculateBookingTotal();
}, [calculateBookingTotal]);

// OR wrap in useCallback:
const loadAvailableRooms = useCallback(() => {
  // implementation
}, [/* dependencies */]);

const calculateBookingTotal = useCallback(() => {
  // implementation
}, [/* dependencies */]);
```

### **5. BookingDetailModal.jsx**
```javascript
const loadBookingDetails = useCallback(async () => {
  // implementation
}, [bookingId]);

useEffect(() => {
  loadBookingDetails();
}, [loadBookingDetails]);
```

### **6. BookingDetailViewModal.jsx**
```javascript
const loadBookingDetails = useCallback(async () => {
  // implementation
}, [bookingId]);

useEffect(() => {
  loadBookingDetails();
}, [loadBookingDetails]);
```

### **7. PaymentStatusCard.jsx**
```javascript
const loadPaymentData = useCallback(async () => {
  // implementation
}, [paymentId]);

useEffect(() => {
  loadPaymentData();
}, [loadPaymentData]);
```

### **8. UserList.jsx**
```javascript
useEffect(() => {
  // uses filters
}, [filters]);
```

### **9. UserProfile.jsx**
```javascript
const loadUserProfile = useCallback(async () => {
  // implementation
}, [userId]);

useEffect(() => {
  loadUserProfile();
}, [loadUserProfile]);
```

### **10. CheckInModal.jsx**
```javascript
const fetchAvailableGuests = useCallback(async () => {
  // implementation
}, []);

useEffect(() => {
  fetchAvailableGuests();
}, [fetchAvailableGuests]);
```

### **11. CheckinDashboard.jsx**
```javascript
const fetchCheckinData = useCallback(async () => {
  // implementation
}, []);

useEffect(() => {
  fetchCheckinData();
}, [fetchCheckinData]);
```

### **12. WalkInBookingModal.jsx**
```javascript
const calculatePricing = useCallback(() => {
  // implementation
}, [checkInDate, checkOutDate, roomType]);

useEffect(() => {
  calculatePricing();
}, [calculatePricing]);
```

---

## 🚀 **Automated Fix Script**

```bash
# Run this in app/admin directory
node fix-react-hooks.js
```

### **fix-react-hooks.js** (Create this file):
```javascript
const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/Partials/Universal/Dashboard/Components/PaymentStatusChart.jsx',
    search: /useEffect\([\s\S]*?\}, \[\]\);/,
    replace: (match) => match.replace('}, []);', '}, [fallbackChartConfig, fallbackSummary]);')
  },
  {
    file: 'src/Partials/Universal/Dashboard/Components/RevenueTrendChart.jsx',
    search: /useEffect\([\s\S]*?\}, \[\]\);/,
    replace: (match) => match.replace('}, []);', '}, [fallbackChartConfig]);')
  },
  // Add more fixes...
];

fixes.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    content = content.replace(fix.search, fix.replace);
    fs.writeFileSync(fix.file, content);
    console.log(`✅ Fixed ${fix.file}`);
  }
});
```

---

## ⚡ **Priority Order**

1. **🔴 High Impact**: Dashboard charts, Booking components
2. **🟡 Medium Impact**: User management, Check-in components  
3. **🟢 Low Impact**: Other components

---

## 🧪 **Testing After Fixes**

```bash
# Test for infinite re-renders
npm start
# Watch console for warnings
# Test component interactions

# Check build warnings
npm run build
```

---

## 📚 **Resources**

- [React Hooks Rules](https://reactjs.org/docs/hooks-rules.html)
- [useCallback Hook](https://reactjs.org/docs/hooks-reference.html#usecallback)
- [useMemo Hook](https://reactjs.org/docs/hooks-reference.html#usememo)
- [ESLint React Hooks Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
