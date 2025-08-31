import React from 'react'
import { Link } from 'react-router-dom';

import { purchaseReportsColumn, purchaseReportsTableData } from './PurchaseReportsTableData';

import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

const PurchaseReportsTable = () => {
    const dataT = purchaseReportsTableData.map((data) => {
        return {
            date: data.date,
            invoiceNo: data.invoiceNo,
            supplierName: data.supplierName,
            amount: data.amount,
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={purchaseReportsColumn} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default PurchaseReportsTable