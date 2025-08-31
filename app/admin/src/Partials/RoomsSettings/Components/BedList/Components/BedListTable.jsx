import React, { useState } from 'react'

import { bedListColumn, bedListTableData } from './BedListTableData';

import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

const BedListTable = () => {
  const [data, setData] = useState(bedListTableData);

  const handleDelete = (bedId) => {
    setData(prevData => prevData.filter(item => item.bedId !== bedId));
  };

  const dataT = data.map((data) => {
    return {
      bedId: data.bedId,
      bedName: data.bedName,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-bed">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button type="button" onClick={() => handleDelete(data.bedId)} className="btn deleterow">
            <i className="bi bi-trash text-danger"></i>
          </button>
        </>
      ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={bedListColumn} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  )
}

export default BedListTable;
