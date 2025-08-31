import React from 'react'

import { bookingReportColumns, bookingReportTableData } from './BookingReportTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const BookingReportTable = () => {
    const dataT = bookingReportTableData.map((data) => {
        return {
            name: data.name,
            roomType: data.roomType,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            paidAmount: data.paidAmount,
            dueAmount: data.dueAmount,
            paymentStatus: (<><span className={`badge ${data.statusBgColor}`}>{data.paymentStatus}</span></>),
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={bookingReportColumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default BookingReportTable