import React, { useState } from 'react';
import { empSalaryColumns, empSalaryTableData } from './EmpSalaryTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const EmpSalaryTable = () => {
  // State to hold salary data
  const [dataT, setDataT] = useState(empSalaryTableData);

  // Function to handle delete action for a specific salary entry
  const handleDelete = (id) => {
    const updatedData = dataT.filter(data => data.id !== id);
    setDataT(updatedData);
  };

  // Mapping dataT to format for DataTable
  const formattedData = dataT.map((data) => ({
    id: data.id,
    name: (
      <>
        <div className="d-flex align-items-center">
          <img src={data.empImg} className="rounded-circle avatar" alt="" />
          <div className="ms-3">
            <h6 className="mb-0">{data.name}</h6>
            <span className="text-muted">{data.email}</span>
          </div>
        </div>
      </>
    ),
    phone: data.phone,
    joinDate: data.joinDate,
    role: data.role,
    salary: data.salary,
    action: (
      <>
        <button type="button" className="btn btn-sm btn-success me-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Send salary slip">
          <i className="bi bi-envelope"></i> Slip
        </button>
        <button type="button" className="btn btn-sm btn-default" title="Print">
          <i className="bi bi-printer"></i>
        </button>
        <button type="button" className="btn btn-sm btn-default deleterow" onClick={() => handleDelete(data.id)} title="Delete">
          <i className="bi bi-trash text-danger"></i>
        </button>
      </>
    ),
  }));

  return (
    <>
      <DataTableHeader />
      <DataTable columns={empSalaryColumns} data={formattedData} />
      <DataTableFooter dataT={formattedData} />
    </>
  );
};

export default EmpSalaryTable;
