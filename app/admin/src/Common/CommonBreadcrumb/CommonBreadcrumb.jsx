import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import { singleTitleMapping } from './Components/TitleMappings';
import PageHeaderAction from './Components/PageHeaderAction'

const CommonBreadcrumb = () => {

    const location = useLocation();
    const pathname = location.pathname;
    const pathSegments = pathname.split('/').filter((segment) => segment);
    const singleTitle = singleTitleMapping[pathname];

  return (
    <div className="px-xl-5 px-lg-4 px-3 py-2 page-header">
        <ol className="breadcrumb mb-0 bg-transparent">
            <li className="breadcrumb-item"><Link to={pathname === '/index-hr' ? '/index-hr' : "/"}>Home</Link></li>
              {pathname === '/' && <li className="breadcrumb-item active"><span>Dashboard</span></li>}
              {pathSegments.map((segment, index) => {
                // const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                // const breadcrumbTitle = segment === 'app' ? 'App' : segment === 'docs' ? 'Docs' : segment === 'pages' ? 'Pages' : null
                return (
                <li key={index} className="breadcrumb-item active">
                  {/* <Link to={path}>{breadcrumbTitle}</Link> */}
                  <span>{index === pathSegments.length - 1 ? singleTitle : ''}</span>
                </li>
                );
              })}
        </ol>
        <ul className="list-unstyled action d-flex align-items-center mb-0">
          <PageHeaderAction/>
        </ul>
    </div>
  )
}

export default CommonBreadcrumb