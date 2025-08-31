import React from 'react'

import { expenseReportColumns, expenseReportTableData } from './ExpenseReportTableData';

import DataTable from '../../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../../Common/DataTableFooter/DataTableFooter';

const ExpenseReportTable = () => {
    const dataT = expenseReportTableData.map((data) => {
        return {
            item: data.item,
            orderBy: data.orderBy,
            from: data.from,
            date: data.date,
            paidBy:(<img src={data.paidBy} alt=""/>),
            status: (<span className={`text-uppercase badge ${data.statusColor}`}>{data.status}</span>),
            amount: data.amount,
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={expenseReportColumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default ExpenseReportTable