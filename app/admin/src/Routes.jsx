import React from "react";
import { Route, Routes as ReactRoutes } from "react-router-dom";

import Index from "./Partials/Universal/Dashboard/Index";
import MyProfile from "./Partials/MyProfile/MyProfile";
import Hotels from "./Partials/Universal/Hotels/Hotels";
import RoomBooking from "./Partials/Universal/Hotels/Components/RoomBooking/RoomBooking";
import RoomFacilitesList from "./Partials/Universal/Hotels/Components/RoomFacilitesList/RoomFacilitesList";
import HouseKeepingAssignRoom from "./Partials/Universal/Hotels/Components/HouseKeepingAssignRoom/HouseKeepingAssignRoom";
import CabList from "./Partials/Universal/Hotels/Components/CabList/CabList";
import ItemsList from "./Partials/Universal/Hotels/Components/ItemsList/ItemsList";
import Personalised from "./Partials/Universal/Hotels/Components/Personalised/Personalised";
import JacuzziBooking from "./Partials/Universal/Hotels/Components/JacuzziBooking/JacuzziBooking";
import BookingReport from "./Partials/Universal/Hotels/Components/BookingReport/BookingReport";
import PromocodeList from "./Partials/Universal/Hotels/Components/PromocodeList/PromocodeList";
import Transaction from "./Partials/Universal/Transaction/Transaction";
import BookingList from "./Partials/Universal/RoomBook/Components/BookingList/BookingList";
import RoomStatus from "./Partials/Universal/RoomBook/Components/RoomStatus/RoomStatus";
import FacilitesDetailsList from "./Partials/Universal/RoomFacilites/Components/FacilitesDetailsList/FacilitesDetailsList";
import RoomSize from "./Partials/Universal/RoomFacilites/Components/RoomSize/RoomSize";
import RoomCleaning from "./Partials/Universal/HouseKeeping/Components/RoomCleaning/RoomCleaning";
import Checklist from "./Partials/Universal/HouseKeeping/Components/Checklist/Checklist";
import QrList from "./Partials/Universal/HouseKeeping/Components/QrList/QrList";
import CleaningReport from "./Partials/Universal/HouseKeeping/Components/CleaningReport/CleaningReport";
import CabBooking from "./Partials/Universal/CabFacility/Components/CabBooking/CabBooking";
import ItemsUnitList from "./Partials/Universal/ItemsManage/Components/ItemsUnitList/ItemsUnitList";
import ItemsDestroyed from "./Partials/Universal/ItemsManage/Components/ItemsDestroyed/ItemsDestroyed";
import ItemsCategory from "./Partials/Universal/ItemsManage/Components/ItemsCategory/ItemsCategory";
import ItemsSuppliers from "./Partials/Universal/ItemsManage/Components/ItemsSuppliers/ItemsSuppliers";
import SwimmingPool from "./Partials/Universal/Personalised/Components/SwimmingPool/SwimmingPool";
import Spa from "./Partials/Universal/Personalised/Components/Spa/Spa";
import Pedicure from "./Partials/Universal/Personalised/Components/Pedicure/Pedicure";
import Theater from "./Partials/Universal/Personalised/Components/Theater/Theater";
import Banquet from "./Partials/Universal/Personalised/Components/Banquet/Banquet";
import AllSettings from "./Partials/Universal/Personalised/Components/AllSettings/AllSettings";
import PurchaseReports from "./Partials/Reports/Components/PurchaseReports/PurchaseReports";
import Invoice from "./Partials/Reports/Components/PurchaseReports/Components/Invoice";
import StockReport from "./Partials/Reports/Components/StockReport/StockReport";
import BedList from "./Partials/RoomsSettings/Components/BedList/BedList";
import BookingTypeList from "./Partials/RoomsSettings/Components/BookingTypeList/BookingTypeList";
import BookingCommission from "./Partials/RoomsSettings/Components/BookingCommission/BookingCommission";
import ComplementaryList from "./Partials/RoomsSettings/Components/ComplementaryList/ComplementaryList";
import FloorPlanList from "./Partials/RoomsSettings/Components/FloorPlanList/FloorPlanList";
import RoomList from "./Partials/RoomsSettings/Components/RoomList/RoomList";
import RoomImages from "./Partials/RoomsSettings/Components/RoomImages/RoomImages";
// NEW: Check-in System Components
import CheckinDashboard from "./components/CheckinDashboard";
import CheckinDashboardSimple from "./components/CheckinDashboardSimple";
// NEW: Enhanced Calendar for Quick Room Availability Check
import EnhancedRoomAvailabilityCalendar from "./components/EnhancedRoomAvailabilityCalendar";
// NEW: Template-based Room Calendar
import TemplateBasedRoomCalendar from "./components/TemplateBasedRoomCalendar";
// NEW: Alternative Room Calendar (Fixed)
import AlternativeRoomCalendar from "./components/AlternativeRoomCalendar";
// NEW: Enhanced Room Visual (Easy to read)
import EnhancedRoomVisual from "./components/EnhancedRoomVisual";
// NEW: Room Availability Table (Table view)
import RoomAvailabilityTable from "./components/RoomAvailabilityTable";
// NEW: Professional Room Calendar (Hotel Industry Standard)
import ProfessionalRoomCalendar from "./components/ProfessionalRoomCalendar";
// NEW: Professional Check-in Dashboard (Hotel Industry Standard)
import ProfessionalCheckinDashboard from "./components/ProfessionalCheckinDashboard";
import SecureProfessionalCheckinDashboard from "./components/SecureProfessionalCheckinDashboard";
import PinCheckWrapper from "./components/PinCheckWrapper";
import PinManagement from "./components/PinManagement";
import PinAnalytics from "./components/PinAnalytics";
import IndexHr from "./Hrms/Usual/HRDashboard/IndexHr";
import Hrms from "./Hrms/Usual/HRMS/Hrms";
import AddEmployees from "./Hrms/Usual/HRMS/Components/AddEmployees/AddEmployees";
import LeaveRequest from "./Hrms/Usual/HRMS/Components/LeaveRequest/LeaveRequest";
import EmployeeProfile from "./Hrms/Usual/HRMS/Components/LeaveRequest/Components/EmployeeProfile";
import AssignedEmployeeList from "./Hrms/Usual/HRMS/Components/AssignedEmployeeList/AssignedEmployeeList";
import Attendance from "./Hrms/Usual/HRMS/Components/Attendance/Attendance";
import EmployeeSalary from "./Hrms/Usual/HRMS/Components/EmployeeSalary/EmployeeSalary";
import PayrollReport from "./Hrms/Usual/HRMS/Components/PayrollReport/PayrollReport";
import EmployeesDepartments from "./Hrms/Usual/HRMS/Components/EmployeesDepartments/EmployeesDepartments";
import ShiftList from "./Hrms/Usual/DutyChanges/Components/ShiftList/ShiftList";
import RosterList from "./Hrms/Usual/DutyChanges/Components/RosterList/RosterList";
import AllEmployees from "./Hrms/Employees/AllEmployees/AllEmployees";
import EmployeeLoan from "./Hrms/Employees/EmployeeLoan/EmployeeLoan";
import EmployeeAppraisal from "./Hrms/Employees/EmployeeAppraisal/EmployeeAppraisal";
import PaySlip from "./Hrms/PayRoll/PaySlip/PaySlip";
import Tuning from "./Tuning/Configuration/Components/Tuning/Tuning";
import CommonSettings from "./Tuning/Configuration/Components/Tuning/Components/CommonSettings/CommonSettings";
import PaymentSettings from "./Tuning/Configuration/Components/Tuning/Components/PaymentSettings/PaymentSettings";
import AccountSettings from "./Tuning/Configuration/Components/Tuning/Components/AccountSettings/AccountSettings";
import RoleAdd from "./Tuning/Configuration/Components/Tuning/Components/RoleAdd/RoleAdd";
import Apps from "./Tuning/Configuration/Components/Tuning/Components/Apps/Apps";
import Inbox from "./Tuning/Configuration/Components/Tuning/Components/Apps/Components/Inbox/Inbox";
import Chat from "./Tuning/Configuration/Components/Tuning/Components/Apps/Components/Chat/Chat";
import Calendar from "./Tuning/Configuration/Components/Tuning/Components/Apps/Components/Calendar/Calendar";
import FileManager from "./Tuning/Configuration/Components/Tuning/Components/Apps/Components/FileManager/FileManager";
import Changelog from "./Tuning/Configuration/Components/Tuning/Components/Apps/Components/Changelog/Changelog";
import RoleList from "./Tuning/RoleManagement/RoleList/RoleList";
import RolePermission from "./Tuning/RoleManagement/RolePermission/RolePermission";
import RoleCreate from "./Tuning/RoleManagement/RoleCreate/RoleCreate";
import RoleAssign from "./Tuning/RoleManagement/RoleAssign/RoleAssign";
import RoleAccess from "./Tuning/RoleManagement/RoleAccess/RoleAccess";
import UserList from "./Tuning/UserManagement/UserList/UserList";
import UserProfile from "./Tuning/UserManagement/UserProfile/UserProfile";
import AddUserPage from "./Tuning/UserManagement/AddUser/AddUserPage";
import AboutUs from "./Tuning/FrontPages/AboutUs/AboutUs";
import ContactUs from "./Tuning/FrontPages/ContactUs/ContactUs";
import PrivacyPolicy from "./Tuning/FrontPages/PrivacyPolicy/PrivacyPolicy";
import TermsConditions from "./Tuning/FrontPages/TermsConditions/TermsConditions";
import Blog from "./Tuning/Application/Blog/Blog";
import BlogDetail from "./Tuning/Application/BlogDetail/BlogDetail";
import SearchPage from "./Tuning/Pages/SearchPage/SearchPage";
import HolidayPricingManagement from "./components/HolidayPricingManagement";

const Routes = () => {
  return (
    <ReactRoutes>

      {/* For Hotels Tab */}
      <Route exact path="/" element={<Index/>} />
      <Route exact path="/index" element={<Index/>} />
      <Route exact path="/dashboard" element={<Index/>} />
      <Route exact path="/my-profile" element={<MyProfile/>} />
      <Route exact path="/hotels" element={<Hotels/>} />
      <Route exact path="/room-booking" element={<RoomBooking/>} />
      <Route exact path="/room-facilites-list" element={<RoomFacilitesList/>} />
      <Route exact path="/housekeeping-assign-room" element={<HouseKeepingAssignRoom/>} />
      <Route exact path="/cab-list" element={<CabList/>} />
      <Route exact path="/items-list" element={<ItemsList/>} />
      <Route exact path="/personalised-jacuzzi" element={<JacuzziBooking/>} />
      <Route exact path="/booking-report" element={<BookingReport/>} />
      <Route exact path="/promocode-list" element={<PromocodeList/>} />
      <Route exact path="/transaction" element={<Transaction/>} />
      <Route exact path="/room-booking-list" element={<BookingList/>} />
      <Route exact path="/room-status" element={<RoomStatus/>} />
      
      {/* NEW: Professional Check-in System */}
      <Route exact path="/checkin-dashboard" element={<CheckinDashboard/>} />
      <Route exact path="/checkin-simple" element={<CheckinDashboardSimple/>} />
      
      {/* NEW: Enhanced Room Availability Calendar */}
                  <Route exact path="/room-availability-calendar" element={<ProfessionalRoomCalendar/>} />
            <Route exact path="/room-availability-table" element={<RoomAvailabilityTable/>} />
            <Route exact path="/room-availability-calendar-visual" element={<EnhancedRoomVisual/>} />
            <Route exact path="/room-availability-calendar-alternative" element={<AlternativeRoomCalendar/>} />
            <Route exact path="/room-availability-calendar-template" element={<TemplateBasedRoomCalendar/>} />
            <Route exact path="/room-availability-calendar-old" element={<EnhancedRoomAvailabilityCalendar/>} />
            
            {/* NEW: Professional Check-in Dashboard - Direct Access */}
                            <Route exact path="/professional-checkin" element={
                  <ProfessionalCheckinDashboard/>
                } />
                            
                            {/* SECURE: Professional Check-in Dashboard with Authentication */}
                            <Route exact path="/professional-checkin-secure" element={
                  <SecureProfessionalCheckinDashboard/>
                } />
                <Route exact path="/professional-checkin-direct" element={
                  <PinCheckWrapper requirePinForActions={true}>
                    <ProfessionalCheckinDashboard/>
                  </PinCheckWrapper>
                } />
                <Route exact path="/professional-checkin-pin" element={
                  <PinCheckWrapper requirePinForActions={true}>
                    <ProfessionalCheckinDashboard/>
                  </PinCheckWrapper>
                } />
                
                {/* PIN Management Routes */}
                <Route exact path="/pin-management" element={<PinManagement/>} />
                <Route exact path="/pin-analytics" element={<PinAnalytics/>} />
      
      <Route exact path="/facilites-details" element={<FacilitesDetailsList/>} />
      <Route exact path="/room-size" element={<RoomSize/>} />
      <Route exact path="/housekeeping-roomcleaning" element={<RoomCleaning/>} />
      <Route exact path="/housekeeping-checklist" element={<Checklist/>} />
      <Route exact path="/housekeeping-qrlist" element={<QrList/>} />
      <Route exact path="/housekeeping-report" element={<CleaningReport/>} />
      <Route exact path="/cab-booking" element={<CabBooking/>} />
      <Route exact path="/items-unit-list" element={<ItemsUnitList/>} />
      <Route exact path="/items-destroyed-list" element={<ItemsDestroyed/>} />
      <Route exact path="/items-category-list" element={<ItemsCategory/>} />
      <Route exact path="/items-suppliers-list" element={<ItemsSuppliers/>} />
      <Route exact path="/personalised" element={<Personalised/>} />
      <Route exact path="/personalised-swimmingpool" element={<SwimmingPool/>} />
      <Route exact path="/personalised-spa" element={<Spa/>} />
      <Route exact path="/personalised-pedicure" element={<Pedicure/>} />
      <Route exact path="/personalised-theater" element={<Theater/>} />
      <Route exact path="/personalised-banquet" element={<Banquet/>} />
      <Route exact path="/personalised-settings" element={<AllSettings/>} />
      <Route exact path="/purchase-report" element={<PurchaseReports/>} />
      <Route exact path="/invoice" element={<Invoice/>} />
      <Route exact path="/stock-report" element={<StockReport/>} />
      <Route exact path="/bed-list" element={<BedList/>} />
      <Route exact path="/booking-type-list" element={<BookingTypeList/>} />
      <Route exact path="/commission-list" element={<BookingCommission/>} />
      <Route exact path="/complementary-list" element={<ComplementaryList/>} />
      <Route exact path="/floor-plan-list" element={<FloorPlanList/>} />
      <Route exact path="/room-list" element={<RoomList/>} />
      <Route exact path="/room-image" element={<RoomImages/>} />

      {/* For Hrms Tab */}
      <Route exact path="/index-hr" element={<IndexHr/>} />
      <Route exact path="/hrms" element={<Hrms/>} />
      <Route exact path="/employees-add" element={<AddEmployees/>} />
      <Route exact path="/employees-leave" element={<LeaveRequest/>} />
      <Route exact path="/employee-profile" element={<EmployeeProfile/>} />
      <Route exact path="/employee-profile/:userId" element={<EmployeeProfile/>} />
      <Route exact path="/duty-assigned-list" element={<AssignedEmployeeList/>} />
      <Route exact path="/employees-attendance" element={<Attendance/>} />
      <Route exact path="/payroll-employee-salary" element={<EmployeeSalary/>} />
      <Route exact path="/payroll-report" element={<PayrollReport/>} />
      <Route exact path="/employees-departments" element={<EmployeesDepartments/>} />
      <Route exact path="/duty-shift-list" element={<ShiftList/>} />
      <Route exact path="/duty-roster-list" element={<RosterList/>} />
      <Route exact path="/employees-all" element={<AllEmployees/>} />
      <Route exact path="/employees-loan" element={<EmployeeLoan/>} />
      <Route exact path="/employees-appraisal" element={<EmployeeAppraisal/>} />
      <Route exact path="/payroll-payslip" element={<PaySlip/>} />

      {/* For Tuning Tab */}
      <Route exact path="/tuning" element={<Tuning/>} />
      <Route exact path="/common-settings" element={<CommonSettings/>} />
      <Route exact path="/payment-set" element={<PaymentSettings/>} />
      <Route exact path="/accounts-setting" element={<AccountSettings/>} />
      <Route exact path="/role-add" element={<RoleAdd/>} />
      <Route exact path="/app" element={<Apps/>} />
      <Route exact path="/inbox" element={<Inbox/>} />
      <Route exact path="/chat" element={<Chat/>} />
      <Route exact path="/calendar" element={<Calendar/>} />
      <Route exact path="/filemanager" element={<FileManager/>} />
      <Route exact path="/changelog" element={<Changelog/>} />
      <Route exact path="/role-list" element={<RoleList/>} />
      <Route exact path="/role-permission" element={<RolePermission/>} />
      <Route exact path="/role-create-list" element={<RoleCreate/>} />
      <Route exact path="/role-assign" element={<RoleAssign/>} />
      <Route exact path="/role-access-list" element={<RoleAccess/>} />
      
      {/* User Management Routes */}
      <Route exact path="/user-list" element={<UserList/>} />
      <Route exact path="/user-management/add" element={<AddUserPage/>} />
      <Route exact path="/user-profile/:userId" element={<UserProfile/>} />
      
      <Route exact path="/about-us" element={<AboutUs/>} />
      <Route exact path="/contact-us" element={<ContactUs/>} />
      <Route exact path="/privacy-policy" element={<PrivacyPolicy/>} />
      <Route exact path="/terms-conditions" element={<TermsConditions/>} />
      <Route exact path="/blog" element={<Blog/>} />
      <Route exact path="/blog-detail" element={<BlogDetail/>} />
      <Route exact path="/search" element={<SearchPage/>} />
      <Route exact path="/holiday-pricing" element={<HolidayPricingManagement/>} />
      
    </ReactRoutes>
  );
};

export default Routes;