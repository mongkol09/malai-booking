import React, { Component } from 'react';
import { assignedEmpListColumns, assignedEmpListTableData } from './AssignedEmpListTableData';
import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

class AssignedEmpListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataT: assignedEmpListTableData.map(data => ({
        id: data.id,
        empName: data.empName,
        shift: data.shift,
        rosterStart: data.rosterStart,
        rosterEnd: data.rosterEnd,
        actions: (
          <>
            <button type="button" className="btn" onClick={() => this.handleDelete(data.id)}>
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
        <DataTable columns={assignedEmpListColumns} data={dataT} />
        <DataTableFooter dataT={dataT} />
      </>
    );
  }
}

export default AssignedEmpListTable;
