import React from 'react';
import { useTable, useFilters, useGlobalFilter, usePagination, useSortBy } from 'react-table';
// import { DefaultColumnFilter } from './DefaultColumnFilter'; // Custom filter component, you can define your own

const DataTable = ({ columns, data, pageSize = 10, globalFilter, setGlobalFilter, setPageSize }) => {
  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: pageSize }, // Use passed pageSize
    },
    useFilters, // Enables filtering
    useGlobalFilter, // Enables global search
    useSortBy, // Enables sorting
    usePagination // Enables pagination
  );


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter: tableSetGlobalFilter,
    setPageSize: tableSetPageSize,
    gotoPage,
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
    pageCount,
    pageOptions,
  } = tableInstance;

  // Update react-table when external state changes
  React.useEffect(() => {
    tableSetGlobalFilter(globalFilter || '');
  }, [globalFilter, tableSetGlobalFilter]);

  React.useEffect(() => {
    tableSetPageSize(pageSize);
  }, [pageSize, tableSetPageSize]);

  // Expose pagination controls to parent
  React.useEffect(() => {
    if (typeof setPageSize === 'function') {
      // Store pagination instance for parent access
      window.tablePaginationInstance = {
        gotoPage,
        previousPage,
        nextPage,
        canPreviousPage,
        canNextPage,
        pageCount,
        pageOptions,
        state
      };
    }
  }, [gotoPage, previousPage, nextPage, canPreviousPage, canNextPage, pageCount, pageOptions, state, setPageSize]);

  return (
    <>
      <div className="table-responsive">
        <table {...getTableProps()} className="table align-middle table-hover dataTable table-body" style={{ width: '100%' }}>
          <thead>
            {headerGroups.map((headerGroup, index) => {
              const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...restHeaderGroupProps} className="small text-muted text-uppercase">
                  {headerGroup.headers.map((column, index) => {
                    const { key: colKey, ...restColProps } = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th key={colKey} {...restColProps}>
                        {column.render('Header')}
                        <span>
                          {' '}
                          <span style={{ opacity: column.isSorted && column.isSortedDesc ? 0.5 : 1 }}>&#x2191;</span>
                          <span style={{ opacity: column.isSorted && !column.isSortedDesc ? 0.5 : 1 }}>&#x2193;</span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row);
              const { key, ...restRowProps } = row.getRowProps();
              return (
                <tr key={key} {...restRowProps} className="row-selectable">
                  {row.cells.map(cell => {
                    const { key: cellKey, ...restCellProps } = cell.getCellProps();
                    return <td key={cellKey} {...restCellProps}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DataTable;