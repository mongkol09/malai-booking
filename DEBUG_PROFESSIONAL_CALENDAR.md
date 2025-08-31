# 🐛 Debug Guide - Professional Room Calendar

## 🔍 **Current Issues & Solutions**

### **Issue 1: `dateFrom.getFullYear is not a function`**
**Status**: ✅ **FIXED**

**Root Cause**: 
- `dateFrom` และ `dateTo` เป็น string แทนที่จะเป็น Date object
- เกิดจากการ assign ค่าจาก `searchFilters` ที่เป็น string

**Solution Applied**:
```javascript
// Convert string dates to Date objects if needed
if (typeof dateFrom === 'string') {
  dateFrom = new Date(dateFrom);
}
if (typeof dateTo === 'string') {
  dateTo = new Date(dateTo);
}

// Fallback to current date if invalid
if (!dateFrom || isNaN(dateFrom.getTime())) {
  dateFrom = new Date();
}
```

---

## 🔧 **API Integration Status**

### **API Endpoints Used**:
```javascript
// Room Types
GET /api/v1/admin/availability/room-types

// Monthly Availability  
GET /api/v1/admin/availability/monthly?year=2025&month=8&roomTypeId=xxx
```

### **Expected API Response Structure**:
```json
{
  "success": true,
  "data": {
    "dailyAvailability": [
      {
        "date": "2025-08-01",
        "roomTypes": [
          {
            "id": "uuid",
            "name": "Standard Room",
            "totalRooms": 10,
            "availableRooms": 8,
            "baseRate": 1500
          }
        ]
      }
    ]
  }
}
```

### **Fallback Handling**:
```javascript
// Handle different API response structures
let dailyData = data.data.dailyAvailability || data.data.days || [];
```

---

## 🧪 **Testing Checklist**

### **✅ Basic Functions**:
- [x] Component loads without errors
- [x] Date type conversion works
- [x] API calls use correct headers
- [x] Loading states display properly
- [x] Error messages show correctly

### **🔄 In Progress**:
- [ ] API returns real data
- [ ] Calendar days populate correctly
- [ ] Room status calculations work
- [ ] Search filters apply properly
- [ ] Navigation works

### **⏳ To Test**:
- [ ] Quick search functionality
- [ ] Date range selection
- [ ] Room type filtering
- [ ] Advanced filters
- [ ] Timeline view
- [ ] Mobile responsiveness

---

## 🌐 **API Testing Commands**

### **Test Room Types API**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-API-Key: hotel-booking-api-key-2024" \
     "http://localhost:3001/api/v1/admin/availability/room-types"
```

### **Test Monthly Availability API**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-API-Key: hotel-booking-api-key-2024" \
     "http://localhost:3001/api/v1/admin/availability/monthly?year=2025&month=8"
```

### **Expected Responses**:
1. **Room Types**: Array of room type objects
2. **Monthly**: Object with `dailyAvailability` array

---

## 🔍 **Debug Console Logs**

### **What to Look For**:
```javascript
// Initial load
🚀 Loading initial data...

// API requests
📅 Fetching data for: 2025-08-01 to 2025-08-31
🌐 API Request: http://localhost:3001/api/v1/admin/availability/monthly?year=2025&month=8
📡 Response status: 200 OK

// Data processing
📊 API Response: {success: true, data: {...}}
📅 Daily data: 31 days
🗓️ Generating calendar view: grid with 31 days
📅 Generated 42 calendar days

// User interactions
📅 Day clicked: {date: Date, dayData: {...}}
```

### **Error Patterns**:
```javascript
// Type errors (FIXED)
❌ Error fetching availability: TypeError: dateFrom.getFullYear is not a function

// API errors
❌ API returned error: Invalid parameters
❌ Failed to fetch availability data

// Data errors
❌ Cannot read property 'roomTypes' of undefined
```

---

## 🛠️ **Current Debug Features**

### **Enhanced Logging**:
- API request URLs
- Response status codes
- Data structure validation
- User interaction tracking

### **Error Handling**:
- Type checking for dates
- Fallback for missing data
- User-friendly error messages
- Retry mechanisms

### **Fallback States**:
- Loading spinner with context
- No data message with retry button
- Invalid date handling
- Missing room data graceful degradation

---

## 🎯 **Next Steps for Full Integration**

### **1. Verify API Connection**:
```javascript
// Check if API is responding
const healthCheck = async () => {
  const response = await fetch('http://localhost:3001/health');
  console.log('API Health:', await response.json());
};
```

### **2. Test Data Flow**:
```javascript
// Verify data structure
console.log('Room Types:', roomTypes);
console.log('Availability Data:', availabilityData);
console.log('Calendar Days:', calendarDays);
```

### **3. Test Search Functions**:
```javascript
// Test quick search
handleQuickSearch('วันนี้');
handleQuickSearch('25/12/2025');

// Test date range
handleQuickDateRange('month');
handleQuickDateRange('week');
```

### **4. Validate Calculations**:
```javascript
// Test room status calculation
const testDay = {
  dayData: {
    roomTypes: [
      { name: 'Standard', totalRooms: 10, availableRooms: 8 },
      { name: 'Deluxe', totalRooms: 5, availableRooms: 2 }
    ]
  }
};
console.log('Room Status:', getRoomStatus(testDay));
```

---

## 🚨 **Common Issues & Solutions**

### **Issue**: Calendar shows empty
**Solution**: Check API response structure, verify date formatting

### **Issue**: Search not working  
**Solution**: Check date parsing logic, verify API parameters

### **Issue**: Room status incorrect
**Solution**: Validate room data structure, check calculation logic

### **Issue**: Navigation broken
**Solution**: Verify date arithmetic, check API calls

---

## 📊 **Performance Monitoring**

### **Metrics to Track**:
- API response time
- Calendar rendering time
- Search response time
- Memory usage
- Error frequency

### **Optimization Areas**:
- Debounced search
- Cached API responses  
- Virtual scrolling for large datasets
- Optimized re-renders

---

## ✅ **Ready for Production Checklist**

- [ ] All API endpoints working
- [ ] Error handling complete
- [ ] Loading states polished
- [ ] Search functionality tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Security headers validated
- [ ] User experience tested

---

## 🎉 **Success Indicators**

### **When Everything Works**:
1. **Console shows**: Clean logs with data counts
2. **Calendar displays**: 42 days with room data
3. **Search works**: Quick date navigation
4. **Filters apply**: Data updates correctly
5. **No errors**: Clean error console
6. **Performance**: Fast response times

**Target**: Professional hotel-grade calendar system! 🏨
