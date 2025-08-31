import React from 'react'

const DataTableFooter = ({ dataT, paginationState }) => {
  
  // Get pagination instance if available
  const pagination = window.tablePaginationInstance || {};
  const {
    state = {},
    gotoPage,
    previousPage,
    nextPage,
    canPreviousPage = false,
    canNextPage = false,
    pageCount = 1
  } = pagination;

  const { pageIndex = 0, pageSize = 10 } = state;
  
  // Calculate display values
  const totalItems = dataT ? dataT.length : 0;
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);
  const currentPage = pageIndex + 1;

  const handlePreviousPage = (e) => {
    e.preventDefault();
    if (canPreviousPage && previousPage) {
      previousPage();
    }
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    if (canNextPage && nextPage) {
      nextPage();
    }
  };

  const handlePageClick = (pageNumber, e) => {
    e.preventDefault();
    if (gotoPage) {
      gotoPage(pageNumber - 1);
    }
  };

  // Generate page numbers (show current and nearby pages)
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pageCount;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems} entries
        {totalItems > pageSize && ` (filtered from ${totalItems} total entries)`}
      </div>
      <div className="dataTables_paginate paging_simple_numbers">
        <ul className="pagination">
          <li className={`paginate_button page-item previous ${!canPreviousPage ? 'disabled' : ''}`}>
            <button 
              type="button"
              onClick={handlePreviousPage}
              className="page-link"
              disabled={!canPreviousPage}
            >
              Previous
            </button>
          </li>
          
          {generatePageNumbers().map((pageNumber) => (
            <li 
              key={pageNumber}
              className={`paginate_button page-item ${pageNumber === currentPage ? 'active' : ''}`}
            >
              <button 
                type="button"
                onClick={(e) => handlePageClick(pageNumber, e)}
                className={`page-link ${pageNumber === currentPage ? 'text-white' : ''}`}
              >
                {pageNumber}
              </button>
            </li>
          ))}
          
          <li className={`paginate_button page-item next ${!canNextPage ? 'disabled' : ''}`}>
            <button 
              type="button"
              onClick={handleNextPage}
              className="page-link"
              disabled={!canNextPage}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DataTableFooter