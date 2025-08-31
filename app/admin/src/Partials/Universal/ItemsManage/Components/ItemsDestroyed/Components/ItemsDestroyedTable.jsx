import React, { useState } from 'react';
import { itemsDestroyedColumns, itemsDestroyedTableData } from './ItemsDestroyedTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ItemsDestroyedTable = () => {
  const [data, setData] = useState(itemsDestroyedTableData);

  const handleDelete = (itemsId) => {
    setData(prevData => prevData.filter(item => item.itemsId !== itemsId));
  };

  const dataT = data.map((data) => {
    return {
      itemsId: data.itemsId,
      itemsName: data.itemsName,
      categoryName: data.categoryName,
      destroyedQuantity: data.destroyedQuantity,
      comment: data.comment,
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
      <DataTable columns={itemsDestroyedColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
}

export default ItemsDestroyedTable;
