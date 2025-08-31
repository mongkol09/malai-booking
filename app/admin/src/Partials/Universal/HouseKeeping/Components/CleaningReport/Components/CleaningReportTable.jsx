import React from 'react'

import { cleaningReportColumn, cleaningReportData } from './CleaningReportTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const CleaningReportTable = () => {
    const dataT = cleaningReportData.map((data) => {
        return {
            id: data.id,
            empName: data.empName,
            complete: data.complete,
            pending: data.pending,
            underProcess: data.underProcess,
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={cleaningReportColumn} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default CleaningReportTable