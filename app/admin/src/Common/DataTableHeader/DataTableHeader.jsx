import React from 'react'

const DataTableHeader = ({ pageSize, setPageSize, globalFilter, setGlobalFilter }) => {

  const sizeOptions = [10, 25, 50, 100]; // Available size options

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (setPageSize) {
      setPageSize(newSize);
    }
  };

  const handleGlobalFilterChange = (e) => {
    const value = e.target.value || '';
    if (setGlobalFilter) {
      setGlobalFilter(value);
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="d-flex align-items-center">
        Show{' '}
        <select
          value={pageSize || 10}
          onChange={handlePageSizeChange}
          className="form-select form-select-sm ms-2"
          style={{ width: 'auto' }}
        >
          {sizeOptions.map((size, index) => (
            <option key={index} value={size}>
              {size}
            </option>
          ))}
        </select>
        &nbsp;entries
      </div>
      <div className="d-flex align-items-center">
        <span className="me-2">Search:</span>
        <input
          value={globalFilter || ''}
          onChange={handleGlobalFilterChange}
          className="form-control form-control-sm"
          placeholder="ค้นหา..."
        />
      </div>
    </div>
  )
}

export default DataTableHeader