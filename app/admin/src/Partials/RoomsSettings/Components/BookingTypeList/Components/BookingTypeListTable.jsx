import React, { Component } from 'react';
import { bookingTypeListColumn, bookingTypeListTableData } from './BookingTypeListTableData';
import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

class BookingTypeListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: bookingTypeListTableData.map(data => ({
        bookingId: data.bookingId,
        bookingtypeName: data.bookingtypeName,
        actions: (
          <>
            <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-bookingtype">
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
        <DataTable columns={bookingTypeListColumn} data={dataT} />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default BookingTypeListTable;
