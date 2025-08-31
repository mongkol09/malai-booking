import React, { useState } from 'react';
import { roomCleaningColumns, roomCleaningTableData } from './RoomCleaningTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const RoomCleaningTable = () => {
    const [data, setData] = useState(roomCleaningTableData);

    const handleDelete = (id) => {
        setData(prevData => prevData.filter(item => item.Id !== id));
    };

    const dataT = data.map((data) => {
        return {
            Id: data.Id,
            empName: data.empName,
            roomNumber: data.roomNumber,
            date: data.date,
            status: data.status,
            actions: (
                <>
                    <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-kipping">
                        <i className="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" onClick={() => handleDelete(data.Id)} className="btn deleterow">
                        <i className="bi bi-trash text-danger"></i>
                    </button>
                </>
            ),
        };
    });

    return (
        <>
            <DataTableHeader />
            <DataTable columns={roomCleaningColumns} data={dataT} />
            <DataTableFooter dataT={dataT} />
        </>
    );
};

export default RoomCleaningTable;
