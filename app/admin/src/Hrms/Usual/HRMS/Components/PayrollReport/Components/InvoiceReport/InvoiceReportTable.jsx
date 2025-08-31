import React from 'react'

import { invoiceReportColumns, invoiceReportTableData } from './InvoiceReportTableData';

import DataTable from '../../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../../Common/DataTableFooter/DataTableFooter';

const InvoiceReportTable = () => {
    const dataT = invoiceReportTableData.map((data) => {
        return {
            invoiceNumber: data.invoiceNumber,
            clients: data.clients,
            date: data.date,
            paidBy:(<img src={data.paidBy} alt=""/>),
            status: (<span className={`text-uppercase badge ${data.statusColor}`}>{data.status}</span>),
            amount: data.amount,
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={invoiceReportColumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default InvoiceReportTable