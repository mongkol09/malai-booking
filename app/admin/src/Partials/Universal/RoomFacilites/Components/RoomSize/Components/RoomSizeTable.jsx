import React from 'react';
import { roomSizeColumns } from './RoomSizeTableData'; // Assuming this is where your column definitions are stored
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const RoomSizeTable = ({ data, onDelete }) => {
  const dataT = data.map((data) => {
    return {
      roomId: data.roomId,
      roomName: data.roomName,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-room">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button type="button" onClick={() => onDelete(data.roomId)} className="btn deleterow">
            <i className="bi bi-trash text-danger"></i>
          </button>
        </>
      ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={roomSizeColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  )
}

export default RoomSizeTable;
