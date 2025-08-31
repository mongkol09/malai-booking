export const rosterListColumns = [
    {
      Header: 'Id',
      accessor: 'id',
    },
    {
      Header: 'Shift',
      accessor: 'shift',
    },
    {
      Header: 'Roster Start',
      accessor: 'rosterStart',
    },
    {
      Header: 'Roster End',
      accessor: 'rosterEnd',
    },
    {
      Header: 'Roster Days',
      accessor: 'rosterDays',
    },
    {
      Header: 'Action',
      accessor: 'action',
    }
  ];

  export const rosterListTableData = [
    {   
        id:'1',
        shift:'Morning shift',
        rosterStart:'2024-01-11',
        rosterEnd: '2024-01-26',
        rosterDays: '16',
    },
    {   
        id:'2',
        shift:'Night shift',
        rosterStart:'2021-12-01',
        rosterEnd: '2022-10-24',
        rosterDays: '28',
    },
    {   
        id:'3',
        shift:'Morning Shift, Night Shift',
        rosterStart:'2021-11-21',
        rosterEnd: '2021-11-30',
        rosterDays: '15',
    },
    {   
      id:'4',
      shift:'Morning Shift, Night Shift',
      rosterStart:'2024-03-21',
      rosterEnd: '2024-04-16',
      rosterDays: '10',
    },
    {   
      id:'5',
      shift:'Morning Shift',
      rosterStart:'2024-04-16',
      rosterEnd: '2024-05-16',
      rosterDays: '17',
    },
    {   
      id:'6',
      shift:'Night Shift',
      rosterStart:'2024-05-16',
      rosterEnd: '2024-06-16',
      rosterDays: '18',
    },
    {   
      id:'7',
      shift:'Morning Half',
      rosterStart:'2024-06-16',
      rosterEnd: '2024-07-16',
      rosterDays: '02',
    },
]