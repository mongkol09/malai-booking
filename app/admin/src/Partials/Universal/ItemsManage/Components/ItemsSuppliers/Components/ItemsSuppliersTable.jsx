import React, { useState } from 'react';

import { itemsSuppliersColumns, itemsSuppliersTableData } from './ItemsSuppliersTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ItemsSuppliersTable = () => {
  const [data, setData] = useState(itemsSuppliersTableData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.id !== id));
  };

  const dataT = data.map((data) => {
    return {
      id: data.id,
      suppliersName: data.suppliersName,
      email: data.email,
      mobile: data.mobile,
      address: data.address,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-items">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button type="button" onClick={() => handleDelete(data.id)} className="btn deleterow">
            <i className="bi bi-trash text-danger"></i>
          </button>
        </>
      ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={itemsSuppliersColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  )
}

export default ItemsSuppliersTable;
