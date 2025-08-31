import React, { Component } from 'react';
import { promocodeListColumns, promocodeListTableData } from './PromocodeListTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

class PromocodeListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: promocodeListTableData.map(data => ({
        roomId: data.roomId,
        roomType: data.roomType,
        from: data.from,
        to: data.to,
        discount: data.discount,
        promoCode: data.promoCode,
        status: <span className={`badge ${data.statusBgColor}`}>{data.status}</span>,
        actions: (
          <>
            <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-promocode"><i className="bi bi-pencil-square"></i></button>
            <button type="button" className="btn deleterow" onClick={() => this.handleDelete(data.roomId)}><i className="bi bi-trash text-danger"></i></button>
          </>
        ),
      })),
    };
  }

  handleDelete = (roomId) => {
    this.setState(prevState => ({
      dataT: prevState.dataT.filter(data => data.roomId !== roomId),
    }));
  };

  render() {
    const { dataT } = this.state;

    return (
      <>
        <DataTableHeader />
        <DataTable columns={promocodeListColumns} data={dataT} />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default PromocodeListTable;
