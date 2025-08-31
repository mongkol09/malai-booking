import React from 'react'

import { invoiceColumn, invoiceTableData } from './InvoiceTableData';

import DataTable from '../../../../../Common/DataTable/DataTable';
import { Link } from 'react-router-dom';

const InvoiceTable = () => {
    const dataT = invoiceTableData.map((data) => {
        return {
            '#': data.Id,
            clientName: (
            <>
            <div className="d-flex align-items-center">
                <img className="avatar sm rounded-circle me-2" src={data.avatar} data-bs-toggle="tooltip" data-placement="top" title="Avatar Name" alt="Avatar"/>
                <Link to="/" title="">{data.clientName}</Link>
            </div>  
            </>
            ),
            email: data.email,
            amount: data.amount,
            status: (<span className={`badge ${data.statusColor}`}>{data.status}</span>),
            actions: (
            <>
                <button type="button" className="btn btn-sm btn-default" title="Send Invoice"><i className="fa fa-envelope"></i></button>
                <button type="button" className="btn btn-sm btn-default" title="Print"><i className="fa fa-print"></i></button>
                <button type="button" className="btn btn-sm btn-default" title="Delete"><i className="fa fa-trash"></i></button>
            </>),
        };
    });

  return (
    <>
      <DataTable columns={invoiceColumn} data={dataT} />
    </>
  )
}

export default InvoiceTable