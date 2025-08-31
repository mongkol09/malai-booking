import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { roleListTableData, roleListcolumns } from './RoleListTableData';

import DataTable from '../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../Common/DataTableFooter/DataTableFooter';

const RoleListTable = () => {
  // State to hold role list data
  const [dataT, setDataT] = useState(roleListTableData);

  // Function to handle delete action for a specific role
  const handleDelete = (id) => {
    const updatedData = dataT.filter(data => data.id !== id);
    setDataT(updatedData);
  };

  // Mapping dataT to format for DataTable
  const formattedData = dataT.map((data) => ({
    id: data.id,
    img: <img src={data.img} className="img-fluid avatar md rounded" alt="" />,
    userName: data.userName,
    email: data.email,
    status: data.status,
    action: (
      <>
        <Link to={`/role-edit/${data.id}`} className="btn"><i className="bi bi-pencil-square"></i></Link>
        <button type="button" className="btn" onClick={() => handleDelete(data.id)}><i className="bi bi-trash text-danger"></i></button> 
      </>
    ),
  }));

  return (
    <>
      <DataTableHeader />
      <DataTable columns={roleListcolumns} data={formattedData} />
      <DataTableFooter dataT={formattedData} />
    </>
  );
};

export default RoleListTable;
