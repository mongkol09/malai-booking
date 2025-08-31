import React from 'react'

import { stockReportColumn, stockReportTableData } from './StockReportTableData';

import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

const StockReportTable = () => {
    const dataT = stockReportTableData.map((data) => {
        return {
            productName: data.productName,
            quantity: data.quantity,
            price: data.price,
            amount: data.amount,
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={stockReportColumn} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default StockReportTable