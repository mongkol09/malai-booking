import React from 'react'
import { Link } from 'react-router-dom';

import { leaveRequestColumns, leaveRequestTableData } from './LeaveRequestTableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const LeaveRequestTable = () => {
    const dataT = leaveRequestTableData.map((data) => {
        return {
            empId: (<><Link to="/employee-profile" className="text-accent">{data.empId}</Link></>),
            employeeName: (
            <>
                <img className="avatar rounded-circle" src={data.empImg} alt=""/>
                <span className="fw-bold ms-1">{data.employeeName}</span>
            </>),
            leaveType: data.leaveType,
            from: data.from,
            to: data.to,
            reason: data.reason,
            actions: (
            <>
            <div className="btn-group" role="group">
                <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#leaveapprove"><i className="bi bi-check2"></i></button>
                <button type="button" className="btn btn-outline-secondary deleterow" data-bs-toggle="modal" data-bs-target="#leavereject"><i className="bi bi-x"></i></button>
            </div>
            </>),
        };
    });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={leaveRequestColumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
}

export default LeaveRequestTable