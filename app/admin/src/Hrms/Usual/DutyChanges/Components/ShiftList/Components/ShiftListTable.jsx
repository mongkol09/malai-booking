import React from 'react'

import { shiftListColumns, shiftListTableData } from './ShiftListTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const ShiftListTable = () => {
    const dataT = shiftListTableData.map((data) => {
        return {
            id: data.id,
            shift: data.shift,
            shiftStart: data.shiftStart,
            shiftEnd: data.shiftEnd,
            shiftHour: data.shiftHour,
            action: (
            <>
                <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-shift"><i className="bi bi-pencil-square"></i></button>
            </>),
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={shiftListColumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default ShiftListTable