import React, { useState } from 'react';
import { itemsUnitColumns, itemsUnitListTableData } from './ItemsUnitListTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ItemsUnitListTable = () => {
  const [data, setData] = useState(itemsUnitListTableData);

  const handleDelete = (itemsId) => {
    setData(prevData => prevData.filter(item => item.itemsId !== itemsId));
  };

  const dataT = data.map((data) => {
    return {
      itemsId: data.itemsId,
      itemsName: data.itemsName,
      shortName: data.shortName,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-facilites">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button type="button" onClick={() => handleDelete(data.itemsId)} className="btn deleterow">
            <i className="bi bi-trash text-danger"></i>
          </button>
        </>
      ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={itemsUnitColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
};

export default ItemsUnitListTable;
