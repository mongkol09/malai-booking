import React, { useState } from 'react';
import { rosterListColumns, rosterListTableData } from './RosterListTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const RosterListTable = () => {
  const [dataT, setDataT] = useState(rosterListTableData.map(data => ({
    id: data.id,
    shift: data.shift,
    rosterStart: data.rosterStart,
    rosterEnd: data.rosterEnd,
    rosterDays: data.rosterDays,
    action: (
      <>
        <button type="button" className="btn" onClick={() => handleDelete(data.id)}>
          <i className="bi bi-trash text-danger"></i>
        </button>
      </>
    ),
  })));

  const handleDelete = (id) => {
    setDataT(prevData => prevData.filter(data => data.id !== id));
  };

  return (
    <>
      <DataTableHeader />
      <DataTable columns={rosterListColumns} data={dataT} />
      <DataTableFooter dataT={dataT} />
    </>
  );
};

export default RosterListTable;
