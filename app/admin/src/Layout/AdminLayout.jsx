import React, { useState } from 'react'
import Routes from '../Routes'

import CommonSidebar from '../Common/CommonSidebar/CommonSidebar'
import CommonHeader from '../Common/CommonHeader/CommonHeader'
import CommonBreadcrumb from '../Common/CommonBreadcrumb/CommonBreadcrumb'

const AdminLayout = ({ themeMode, themeColor, borderStroke, boxLayout, monochrome, borderRadius, iconColor, gradientColor }) => {

  const [sidebarHidden, setSidebarHidden] = useState(false);

  const toggleSidebar = () => {
    setSidebarHidden(prevState => !prevState);
  };

  return (
    <div data-ha={`theme-${themeColor}`} data-bs-theme={themeMode} className={`Hotel_Head ${gradientColor} ${sidebarHidden && 'sidebar-hide'} ${borderStroke} ${boxLayout} ${monochrome} ${borderRadius}`}>
      {/* <main className="container-fluid px-0"> */}
      <main className={`${boxLayout === 'box-layout rightbar-hide' ? 'container' : 'container-fluid'} px-0`}>
        <CommonSidebar iconColor={iconColor} />
        <div className="content">
          <CommonHeader toggleSidebar={toggleSidebar} />
          <CommonBreadcrumb />

          <Routes />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout