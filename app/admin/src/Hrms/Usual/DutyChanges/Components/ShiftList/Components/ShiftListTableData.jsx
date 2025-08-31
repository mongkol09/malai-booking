export const shiftListColumns = [
    {
      Header: 'Id',
      accessor: 'id',
    },
    {
      Header: 'Shift',
      accessor: 'shift',
    },
    {
      Header: 'Shift Start',
      accessor: 'shiftStart',
    },
    {
      Header: 'Shift End',
      accessor: 'shiftEnd',
    },
    {
      Header: 'Shift Hour',
      accessor: 'shiftHour',
    },
    {
      Header: 'Action',
      accessor: 'action',
    }
  ];

  export const shiftListTableData = [
    {   
        id:'1',
        shift:'Morning Shift',
        shiftStart:'00:00',
        shiftEnd: '12:00',
        shiftHour: '12:00',
    },
    {   
        id:'2',
        shift:'Night Shift',
        shiftStart:'12:01',
        shiftEnd: '23:59',
        shiftHour: '11:59',
    },
    {   
        id:'3',
        shift:'Morning , Night Shift',
        shiftStart:'00:00',
        shiftEnd: '24:00',
        shiftHour: '24:00',
    },
    {   
        id:'4',
        shift:'Morning Half',
        shiftStart:'08:00',
        shiftEnd: '01:00',
        shiftHour: '05:00',
    },
    {   
        id:'5',
        shift:'Night Half',
        shiftStart:'12:00',
        shiftEnd: '17:00',
        shiftHour: '05:00',
    },
]