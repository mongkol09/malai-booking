import React, { useState } from 'react';
import { cabListColumns, cabListTableData } from './CabListTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const CabListTable = () => {
  const [data, setData] = useState(cabListTableData);

  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.id !== id));
  };

  const dataT = data.map((data) => {
    return {
      id: data.id,
      car: data.car,
      carNumber: data.carNumber,
      carType: data.carType,
      fuelType: data.fuelType,
      seatCapacity: data.seatCapacity,
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
      <DataTable columns={cabListColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
};

export default CabListTable;
