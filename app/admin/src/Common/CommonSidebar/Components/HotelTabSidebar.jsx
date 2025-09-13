import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const HotelTabSidebar = ({iconColor}) => {
  return (
    <div className="tab-pane fade active show" id="tab_hotels" role="tabpanel">
        <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Universal</h6>
        <ul className={`list-unstyled mb-4 menu-list ${iconColor}`}>
            <li>
                <NavLink to="/" aria-label="Hotel Dashboard">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
                        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
                        <path d="M10 12h4v4h-4z"></path>
                    </svg>
                    <span className="mx-3">Dashboard</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/hotels" aria-label="Hotel Front">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24"  viewBox="0 0 24 24"  stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M3 21l18 0" />
                        <path d="M4 21v-11l2.5 -4.5l5.5 -2.5l5.5 2.5l2.5 4.5v11" />
                        <path d="M12 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M9 21v-5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v5" />
                    </svg>
                    <span className="mx-3">Hotels</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/transaction" aria-label="Transaction list">
                    <svg className="svg-stroke" xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"></path>
                        <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4"></path>
                    </svg>
                    <span className="mx-3">Transaction</span>
                </NavLink>
            </li>
            <li>
                <Link to="#RoomMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M14 12v.01" />
                        <path d="M3 21h18" />
                        <path d="M6 21v-16a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v16" />
                    </svg>
                    <span className="mx-3">Room Book</span>
                </Link>
                <ul className="collapse list-unstyled" id="RoomMenu">
                    <li><NavLink to="/room-booking-list" aria-label="Booking List">Booking List</NavLink></li>
                    <li><NavLink to="/professional-checkin" aria-label="Check in - out">Check in - out</NavLink></li>
                    <li><NavLink to="/checkin-dashboard" aria-label="Check-in Dashboard">✨ Check-in System</NavLink></li>
                    <li><NavLink to="/room-status" aria-label="Room Status">Room Status</NavLink></li>
                    <li><NavLink to="/room-availability-calendar" aria-label="Room Availability Calendar">📅 ปฏิทินห้องว่าง</NavLink></li>
                <li><NavLink to="/room-availability-table" aria-label="Room Availability Table">📊 ตารางห้องว่าง</NavLink></li>
                </ul>
            </li>
            <li>
                <Link to="#RoomFacilitesMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M7 3m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" />
                        <path d="M12 3v2" />
                        <path d="M10 15v.01" />
                        <path d="M10 18v.01" />
                        <path d="M14 18v.01" />
                        <path d="M14 15v.01" />
                    </svg>
                    <span className="mx-3">Room Facilites</span>
                </Link>
                <ul className="collapse list-unstyled" id="RoomFacilitesMenu">
                    <li><NavLink to="/room-facilites-list" aria-label="Facilites List">Facilites List</NavLink></li>
                    <li><NavLink to="/facilites-details" aria-label="Facilites Details">Facilites Details</NavLink></li>
                    <li><NavLink to="/room-size" aria-label="Room Size">Room Size</NavLink></li>
                </ul>
            </li>
            <li>
                <Link to="#HousekeepingMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M8.5 10a1.5 1.5 0 0 1 -1.5 -1.5a5.5 5.5 0 0 1 11 0v10.5a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2c0 -1.38 .71 -2.444 1.88 -3.175l4.424 -2.765c1.055 -.66 1.696 -1.316 1.696 -2.56a2.5 2.5 0 1 0 -5 0a1.5 1.5 0 0 1 -1.5 1.5z" />
                    </svg>
                    <span className="mx-3">House keeping</span>
                </Link>
                <ul className="collapse list-unstyled" id="HousekeepingMenu">
                    <li><NavLink to="/housekeeping-assign-room" aria-label="Housekeeping All">Assign Room</NavLink></li>
                    <li><NavLink to="/housekeeping-roomcleaning" aria-label="Housekeeping Cleaning">Room Cleaning</NavLink></li>
                    <li><NavLink to="/housekeeping-checklist" aria-label="Housekeeping Checklist">Checklist</NavLink></li>
                    <li><NavLink to="/housekeeping-qrlist" aria-label="Housekeeping QR">QR List</NavLink></li>
                    <li><NavLink to="/housekeeping-report" aria-label="Housekeeping Reports">Cleaning Report</NavLink></li>
                </ul>
            </li>
            <li>
                <Link to="#CarbookingMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                    </svg>
                    <span className="mx-3">Cab Facility</span>
                </Link>
                <ul className="collapse list-unstyled" id="CarbookingMenu">
                    
                    <li><NavLink to="/cab-list" aria-label="Cab Details">Cab List</NavLink></li>
                    <li><NavLink to="/cab-booking" aria-label="Cab Booking">Cab Booking</NavLink></li>
                </ul>
            </li>
            <li>
                <Link to="#ItemsManageMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M13 5h8" />
                        <path d="M13 9h5" />
                        <path d="M13 15h8" />
                        <path d="M13 19h5" />
                        <path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                        <path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                    </svg>
                    <span className="mx-3">Items Manage</span>
                </Link>
                <ul className="collapse list-unstyled" id="ItemsManageMenu">
                    <li><NavLink to="/items-unit-list" aria-label="Items Unit List">Items Unit List</NavLink></li>
                    <li><NavLink to="/items-list" aria-label="Items List">Items List</NavLink></li>
                    <li><NavLink to="/items-destroyed-list" aria-label="Items Destroyed">Items Destroyed</NavLink></li>
                    <li><NavLink to="/items-category-list" aria-label="Items Category">Items Category</NavLink></li>
                    <li><NavLink to="/items-suppliers-list" aria-label="Items Suppliers">Items Suppliers</NavLink></li>
                </ul>
            </li>
            <li>
                <Link to="#PersonalisedMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24"  viewBox="0 0 24 24"  stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12 8m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
                        <path d="M8 11a5 5 0 1 0 3.998 1.997" />
                        <path d="M12.002 19.003a5 5 0 1 0 3.998 -8.003" />
                    </svg>
                    <span className="mx-3">Personalised</span>
                </Link>
                <ul className="collapse list-unstyled" id="PersonalisedMenu">
                    <li><NavLink to="/personalised-jacuzzi" aria-label="">Jacuzzi</NavLink></li>
                    <li><NavLink to="/personalised-swimmingpool" aria-label="">Swimming pool</NavLink></li>
                    <li><NavLink to="/personalised-spa" aria-label="">Spa</NavLink></li>
                    <li><NavLink to="/personalised-pedicure" aria-label="">Pedicure</NavLink></li>
                    <li><NavLink to="/personalised-theater" aria-label="">Theater</NavLink></li>
                    <li><NavLink to="/personalised-banquet" aria-label="">Banquet</NavLink></li>
                    <li><NavLink to="/personalised-settings" aria-label="">All Settings</NavLink></li>
                </ul>
            </li>
            <li>
                <Link to="#BookingHistoryMenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle" aria-label="Booking History">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svg-stroke" width="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M9 11h6l-6 -6v6z" />
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                        <path d="M12 7v5l3 3" />
                    </svg>
                    <span className="mx-3">📚 Booking History</span>
                </Link>
                <ul className="collapse list-unstyled" id="BookingHistoryMenu">
                    <li><NavLink to="/booking-history" aria-label="Booking History">📋 History Records</NavLink></li>
                    <li><NavLink to="/booking-analytics" aria-label="Booking Analytics">📊 Analytics</NavLink></li>
                    <li><NavLink to="/expired-bookings" aria-label="Expired Bookings">⏰ Expired Bookings</NavLink></li>
                    <li><NavLink to="/archive-management" aria-label="Archive Management">🗃️ Archive Management</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Reports</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/booking-report" aria-label="Booking Reports">Booking Reports</NavLink></li>
                    <li><NavLink to="/purchase-report" aria-label="Purchase Report">Purchase Reports</NavLink></li>
                    <li><NavLink to="/stock-report" aria-label="Stock Report">Stock Reports</NavLink></li>
                </ul>
            </li>
            <li className="py-2 mt-2">
                <h6 className="fl-title title-font ps-2 small text-uppercase text-muted" style={{"--dynamic-color": "var(--theme-color1)"}}>Rooms Settings</h6>
                <ul className="list-unstyled">
                    <li><NavLink to="/bed-list" aria-label="Bed List">Bed List</NavLink></li>
                    <li><NavLink to="/booking-type-list" aria-label="Booking Type List">Booking Type List</NavLink></li>
                    <li><NavLink to="/commission-list" aria-label="Booking Commission ">Booking Commission </NavLink></li>
                    <li><NavLink to="/complementary-list" aria-label="Complementary">Complementary List</NavLink></li>
                    <li><NavLink to="/floor-plan-list" aria-label="Floor Plan List">Floor Plan List</NavLink></li>
                    <li><NavLink to="/room-list" aria-label="Room List">Room List</NavLink></li>
                    <li><NavLink to="/room-image" aria-label="Room Images">Room Images</NavLink></li>
                    <li><NavLink to="/promocode-list" aria-label="Promocode List">Promocode List</NavLink></li>
                </ul>
            </li>
        </ul>
    </div>
  )
}

export default HotelTabSidebar