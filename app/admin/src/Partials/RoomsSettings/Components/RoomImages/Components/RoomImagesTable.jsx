import React, { Component } from 'react';
import { roomImagesColumn, roomImagesTableData } from './RoomImagesTableData';
import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

class RoomImagesTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: roomImagesTableData.map(data => ({
        roomId: data.roomId,
        roomType: data.roomType,
        roomImages: <img src={data.roomImages} className="img-fluid avatar xl rounded" alt="roomImages" />,
        actions: (
          <>
            <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-image">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button type="button" className="btn deleterow" onClick={() => this.handleDelete(data.roomId)}>
              <i className="bi bi-trash text-danger"></i>
            </button>
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
        <DataTable columns={roomImagesColumn} data={dataT} />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default RoomImagesTable;
