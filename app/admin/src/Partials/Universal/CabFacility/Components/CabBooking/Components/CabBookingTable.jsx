import React, { useState } from 'react';
import { cabBookingColumns, cabBookingTableData } from './CabBookingTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const CabBookingTable = () => {
  const [data, setData] = useState(cabBookingTableData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.id !== id));
  };

  const dataT = data.map((data) => {
    return {
      id: data.id,
      car: data.car,
      carNumber: data.carNumber,
      driver: data.driver,
      customer: data.customer,
      date: data.date,
      type: data.type,
      time: data.time,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-booking">
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
      <DataTable columns={cabBookingColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
};

export default CabBookingTable;
