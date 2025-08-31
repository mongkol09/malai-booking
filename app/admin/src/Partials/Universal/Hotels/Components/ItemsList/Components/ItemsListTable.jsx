import React, { useState } from 'react';
import { itemsListColumns, itemsListTableData } from './ItemsListTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ItemsListTable = () => {
  const [data, setData] = useState(itemsListTableData);

  const handleDelete = (itemsId) => {
    setData(prevData => prevData.filter(item => item.itemsId !== itemsId));
  };

  const dataT = data.map((data) => {
    return {
      itemsId: data.itemsId,
      itemsName: data.itemsName,
      categoryName: data.categoryName,
      unit: data.unit,
      totalItems: data.totalItems,
      itemsUsed: data.itemsUsed,
      laundryItem: data.laundryItem,
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-items">
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
      <DataTable columns={itemsListColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
}

export default ItemsListTable;
