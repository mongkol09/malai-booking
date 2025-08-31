import React, { Component } from 'react';
import { bookingCommissionColumn, bookingCommissionTableData } from './BookingCommissionTableData';
import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

class BookingCommissionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: bookingCommissionTableData.map(data => ({
        bookingId: data.bookingId,
        bookingtypeName: data.bookingtypeName,
        bookingtypeSoruce: data.bookingtypeSoruce,
        commissionRate: data.commissionRate,
        actions: (
          <>
            <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-commission">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button type="button" className="btn deleterow" onClick={() => this.handleDelete(data.bookingId)}>
              <i className="bi bi-trash text-danger"></i>
            </button>
          </>
        ),
      })),
    };
  }

  handleDelete = (bookingId) => {
    this.setState(prevState => ({
      dataT: prevState.dataT.filter(data => data.bookingId !== bookingId),
    }));
  };

  render() {
    const { dataT } = this.state;

    return (
      <>
        <DataTableHeader />
        <DataTable columns={bookingCommissionColumn} data={dataT} />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default BookingCommissionTable;
