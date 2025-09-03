import React from 'react'

const Changelog = () => {
  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="row g-xl-4 g-lg-3 g-2 justify-content-between">
                <div className="col-xxl-9 col-xl-9 col-lg-9">
                    <ul>
                        <li>
                            <div className="d-flex align-items-end ps-3">
                                <span className="h1">[ v1.0 ]</span>
                                <span className="ps-2 mb-2">-- 23 Feb 2024</span>
                            </div>
                            <ul className="mt-3 lh-lg">
                                <li><b>Initial release of Malai!</b></li>
                                <li>bootstrap ^5.3.2</li>
                                <li>@types/react ^18.2.14</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Changelog