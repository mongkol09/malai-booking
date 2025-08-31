import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { roleAccessTableData, roleAccesscolumns } from './RoleAccessTableData';

import DataTable from '../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../Common/DataTableFooter/DataTableFooter';

const RoleAccessTable = () => {
  // State to hold role access data
  const [dataT, setDataT] = useState(roleAccessTableData);

  // Function to handle delete action for a specific role access entry
  const handleDelete = (id) => {
    const updatedData = dataT.filter(data => data.id !== id);
    setDataT(updatedData);
  };

  // Mapping dataT to format for DataTable
  const formattedData = dataT.map((data) => ({
    id: data.id,
    userName: data.userName,
    roleName: data.roleName,
    action: (
      <>
        <Link to="/role-assign" className="btn"><i className="bi bi-pencil-square"></i></Link>
        <button type="button" className="btn" onClick={() => handleDelete(data.id)}><i className="bi bi-trash text-danger"></i></button>
      </>
    ),
  }));

  return (
    <>
      <DataTableHeader />
      <DataTable columns={roleAccesscolumns} data={formattedData} />
      <DataTableFooter dataT={formattedData} />
    </>
  );
};

export default RoleAccessTable;
