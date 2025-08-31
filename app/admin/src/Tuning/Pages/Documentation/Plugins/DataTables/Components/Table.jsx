import React from 'react'

import { TableData, tablecolumns } from './TableData';

import DataTable from '../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../Common/DataTableFooter/DataTableFooter';

const Table = () => {
    const dataT = TableData.map((data) => {
        return {
            name: data.name,
            position: data.position,
            office: data.office,
            age: data.age,
            startdate: data.startdate,
            salary: data.salary,
          };
    });

    return (
        <>
          <DataTableHeader />
          <DataTable columns={tablecolumns} data={dataT} />
          <DataTableFooter dataT={dataT}/>
        </>
    )
}

export default Table