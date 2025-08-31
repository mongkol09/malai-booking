import React, { useState } from 'react';
import { checklistColumns, checklistTableData } from './ChecklistTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ChecklistTable = () => {
  const [data, setData] = useState(checklistTableData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.id !== id));
  };

  const dataT = data.map((data) => {
    return {
      id: data.id,
      checkPoint: data.checkPoint,
      type: data.type,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-checklist">
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
      <DataTable columns={checklistColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
};

export default ChecklistTable;
