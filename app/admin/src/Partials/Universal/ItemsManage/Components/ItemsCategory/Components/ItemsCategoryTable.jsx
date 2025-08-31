import React, { useState } from 'react';
import { itemsCategoryColumns, itemsCategoryTableData } from './ItemsCategoryTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ItemsCategoryTable = () => {
  const [data, setData] = useState(itemsCategoryTableData);

  const handleDelete = (itemsId) => {
    setData(prevData => prevData.filter(item => item.itemsId !== itemsId));
  };

  const dataT = data.map((data) => {
    return {
      itemsId: data.itemsId,
      categoryName: data.categoryName,
      status: data.status,
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
      <DataTable columns={itemsCategoryColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
}

export default ItemsCategoryTable;
