#!/bin/bash
# 🔧 Frontend Warnings Auto-Fix Script
# Usage: ./fix-warnings.sh

echo "🚀 Starting Frontend Warnings Auto-Fix..."

# Phase 1: Fix unused imports/variables
echo "📝 Phase 1: Removing unused imports and variables..."

# Fix unused imports
echo "Fixing unused imports..."

# AuthLayout.jsx - Remove unused Signin, Signup
sed -i 's/import { Signin, Signup } from.*;//g' src/Layout/AuthLayout.jsx

# PurchaseReportsTable.jsx - Remove unused Link
sed -i 's/import.*Link.*from.*react-router-dom.*;//g' src/Partials/Reports/Components/PurchaseReports/Components/PurchaseReportsTable.jsx

# Dashboard Index.jsx - Remove unused imports
sed -i 's/import.*CardData.*from.*;//g' src/Partials/Universal/Dashboard/Index.jsx
sed -i 's/import.*ReservationsChart.*from.*;//g' src/Partials/Universal/Dashboard/Index.jsx

# RoomBooking.jsx - Remove unused roomService
sed -i 's/import.*roomService.*from.*;//g' src/Partials/Universal/Hotels/Components/RoomBooking/RoomBooking.jsx

# Blog.jsx - Remove unused TrendingData
sed -i 's/import.*TrendingData.*from.*;//g' src/Tuning/Application/Blog/Blog.jsx

# Documentation files - Remove unused Link imports
sed -i 's/import.*Link.*from.*react-router-dom.*;//g' src/Tuning/Pages/Documentation/Plugins/Flatpickr/Flatpickr.jsx
sed -i 's/import.*Link.*from.*react-router-dom.*;//g' src/Tuning/Pages/Documentation/Plugins/ToastUICalendar/ToastUICalendar.jsx

# HolidayPricingManagement.jsx - Remove unused Link
sed -i 's/import.*Link.*from.*react-router-dom.*;//g' src/components/HolidayPricingManagement.jsx

echo "✅ Phase 1 completed"

# Phase 2: Fix code quality issues
echo "📝 Phase 2: Fixing code quality issues..."

# Fix == to === in Apps.jsx
sed -i 's/==/===/g' src/Tuning/Configuration/Components/Tuning/Components/Apps/Apps.jsx

echo "✅ Phase 2 completed"

# Phase 3: Add missing alt attributes
echo "📝 Phase 3: Adding missing alt attributes..."

# FileManagerTable.jsx - Add alt attribute
sed -i 's/<img src=/<img alt="File icon" src=/g' src/Tuning/Configuration/Components/Tuning/Components/Apps/Components/FileManager/Components/FileManagerTable.jsx

echo "✅ Phase 3 completed"

echo "🎉 Auto-fix completed! Run 'npm run build' to check remaining warnings."
