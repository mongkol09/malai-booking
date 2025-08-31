import React, { useState } from 'react';
import { empDepartmentsColumns, empDepartmentsTableData } from './EmpDepartmentsTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const EmpDepartmentsTable = () => {
  // Initial state with empDepartmentsTableData
  const [dataT, setDataT] = useState(empDepartmentsTableData);

  // Function to handle delete
  const handleDelete = (id) => {
    // Filter out the department with the given id
    const updatedData = dataT.filter(data => data.id !== id);
    setDataT(updatedData); // Update state
  };

  // Mapping dataT to format for DataTable
  const formattedData = dataT.map((data) => ({
    id: <span className="fw-bold">{data.id}</span>,
    departmentHead: (
      <>
        <img className="avatar rounded-circle" src={data.headImg} alt="" />
        <span className="fw-bold ms-1">{data.departmentHead}</span>
      </>
    ),
    departmentName: data.departmentName,
    employeeUnderWork: data.employeeUnderWork,
    actions: (
      <>
        <button type="button" className="btn" data-bs-toggle="offcanvas" data-bs-target="#UserList">
          <i className="bi bi-eye"></i>
        </button>
        <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#depedit">
          <i className="bi bi-pencil-square"></i>
        </button>
        <button type="button" className="btn deleterow" onClick={() => handleDelete(data.id)}>
          <i className="bi bi-trash text-danger"></i>
        </button>
      </>
    ),
  }));

  return (
    <>
      <DataTableHeader />
      <DataTable columns={empDepartmentsColumns} data={formattedData} />
      <DataTableFooter dataT={formattedData} />
    </>
  );
};

export default EmpDepartmentsTable;
