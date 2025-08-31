import React, { useState } from 'react';

import { roomFacilitesColumns, roomFacilitesData } from './RoomFacilitesData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const RoomFacilitesTable = () => {
  const [data, setData] = useState(roomFacilitesData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.facilitesId !== id));
  };

  const dataT = data.map((data) => {
    return {
      facilitesId: data.facilitesId,
      facilitesName: data.facilitesName,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-facilites">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button type="button" onClick={() => handleDelete(data.facilitesId)} className="btn deleterow">
            <i className="bi bi-trash text-danger"></i>
          </button>
        </>
      ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={roomFacilitesColumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  );
}

export default RoomFacilitesTable;
