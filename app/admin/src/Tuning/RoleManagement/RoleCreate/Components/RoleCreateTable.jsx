import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { roleCreateTableData, roleCreatecolumns } from './RoleCreateTableData';

import DataTable from '../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../Common/DataTableFooter/DataTableFooter';

const RoleCreateTable = () => {
  // State to hold role creation data
  const [dataT, setDataT] = useState(roleCreateTableData);

  // Function to handle delete action for a specific role
  const handleDelete = (id) => {
    const updatedData = dataT.filter(data => data.id !== id); 
    setDataT(updatedData);
  };

  // Mapping dataT to format for DataTable
  const formattedData = dataT.map((data) => ({
    id: data.id,
    roleName: data.roleName,
    description: data.description,
    action: (
      <>
        <Link to="/role-permission" className="btn"><i className="bi bi-pencil-square"></i></Link>
        <button type="button" className="btn" onClick={() => handleDelete(data.id)}><i className="bi bi-trash text-danger"></i></button>
      </>
    ),
  }));

  return (
    <>
      <DataTableHeader />
      <DataTable columns={roleCreatecolumns} data={formattedData} />
      <DataTableFooter dataT={formattedData} />
    </>
  );
};

export default RoleCreateTable;
