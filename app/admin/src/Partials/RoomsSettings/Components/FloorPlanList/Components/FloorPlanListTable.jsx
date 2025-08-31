import React, { Component } from 'react';
import { floorPlanListColumn, floorPlanListTableData } from './FloorPlanListTableData';
import DataTable from '../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../Common/DataTableFooter/DataTableFooter';

class FloorPlanListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: floorPlanListTableData.map(data => ({
        id: data.id,
        floorName: data.floorName,
        numberOfRoom: data.numberOfRoom,
        startRoomNumber: data.startRoomNumber,
        actions: (
          <>
            <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#edit-floor">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button type="button" className="btn deleterow" onClick={() => this.handleDelete(data.id)}>
              <i className="bi bi-trash text-danger"></i>
            </button>
          </>
        ),
      })),
    };
  }

  handleDelete = (id) => {
    this.setState(prevState => ({
      dataT: prevState.dataT.filter(data => data.id !== id),
    }));
  };

  render() {
    const { dataT } = this.state;

    return (
      <>
        <DataTableHeader />
        <DataTable columns={floorPlanListColumn} data={dataT} />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default FloorPlanListTable;
