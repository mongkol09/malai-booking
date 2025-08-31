import React from 'react'
import { transactionColumns, transactionTableData } from './TransactionData';

import DataTable from '../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../Common/DataTableFooter/DataTableFooter';

const TransactionTable = () => {
    const dataT = transactionTableData.map((data) => {
        return {
          checkbox: (
            <div className="form-check">
              <input className="form-check-input" type="checkbox" defaultValue="" />
            </div>
          ),
          productDescription: data.description,
          status: <span className="text-primary">{data.status}</span>,
          price: data.price,
          orderNo: (
            <>
              {data.order_no}
              <div className="small text-muted">{data.time}</div>
            </>
          ),
          orderTotal: data.order_total,
          action: (
            <>
              <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Send Email">
                <i className="fa fa-envelope"></i>
              </button>
              <button type="button" className="btn btn-link btn-sm text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="Download invoice">
                <i className="fa fa-download"></i>
              </button>
            </>
          ),
        };
    });

    return (
        <>
          <DataTableHeader />
          <DataTable columns={transactionColumns} data={dataT} />
          <DataTableFooter dataT={dataT}/>
        </>
      )
}

export default TransactionTable