import React from 'react';
import { facilitesDetailsColumns } from './FacilitesDetailsListData'; // Assuming this is where your column definitions are stored
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const FacilitesDetailsListTable = ({ data, onDelete }) => {
  const dataT = data.map((data) => {
    return {
      facilitesId: data.facilitesId,
      facilitesType: data.facilitesType,
      facilitesName: data.facilitesName,
      facilitesImage: (
        <>
          <img src={data.facilitesImage} className="img-fluid w-25" alt={data.imgAlt} />
        </>
      ),
      actions: (
        <>
          <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-facilites">
            <i className="bi bi-pencil-square"></i>
          </button>
          <button type="button" onClick={() => onDelete(data.facilitesId)} className="btn deleterow">
            <i className="bi bi-trash text-danger"></i>
          </button>
        </>
      ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={facilitesDetailsColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  )
}

export default FacilitesDetailsListTable;
