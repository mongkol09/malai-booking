import React, { useState } from 'react';
import { empLoanColumns, empLoanTableData } from './EmpLoanTableData';

import DataTable from '../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../Common/DataTableFooter/DataTableFooter';

const EmpLoanTable = () => {
  // State to hold loan data
  const [dataT, setDataT] = useState(empLoanTableData);

  // Function to handle delete action for a specific loan
  const handleDelete = (id) => {
    const updatedData = dataT.filter(data => data.employeeID !== id);
    setDataT(updatedData);
  };

  // Mapping dataT to format for DataTable
  const formattedData = dataT.map((data) => ({
    employeeID: <span className="fw-bold">{data.employeeID}</span>,
    employeeName: (
      <>
        <div className="d-flex align-items-center">
          <img className="avatar rounded-circle" src={data.empImg} alt="" />
          <div className="ms-2">
            <span className="fw-bold ms-1">{data.employeeName}</span>
            <span className="text-muted ms-1 d-block">Purpose: {data.purpose}</span>
          </div>
        </div>
      </>
    ),
    date: data.date,
    loanAmount: <span className="text-danger fw-bold">{data.loanAmount}</span>,
    loanPeriod: (
      <>
        <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#LoanEdit">
          <i className="bi bi-pencil-square"></i>
        </button>
        <button type="button" className="btn deleterow" onClick={() => handleDelete(data.employeeID)}>
          <i className="bi bi-trash text-danger"></i>
        </button>
      </>
    ),
  }));

  return (
    <>
      <DataTableHeader />
      <DataTable columns={empLoanColumns} data={formattedData} />
      <DataTableFooter dataT={formattedData} />
    </>
  );
};

export default EmpLoanTable;
