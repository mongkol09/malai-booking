export const bookingReportColumns = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Room Type',
      accessor: 'roomType',
    },
    {
      Header: 'Check In',
      accessor: 'checkIn',
    },
    {
      Header: 'Check Out',
      accessor: 'checkOut',
    },
    {
      Header: 'Paid Amount',
      accessor: 'paidAmount',
    },
    {
      Header: 'Due Amount',
      accessor: 'dueAmount',
    },
    {
        Header: 'Payment Status',
        accessor: 'paymentStatus',
    },
  ];

  export const bookingReportTableData = [
    {   
        name:'Frank Baker',
        roomType:'Single',
        checkIn:'12/03/2021',
        checkOut: '14/03/2021',
        paidAmount: '0.00',
        dueAmount: '$230',
        paymentStatus:'Pending',
        statusBgColor:'text-bg-warning'
    },
    {   
        name:'Rya Randall',
        roomType:'Deluxe',
        checkIn:'11/04/2021',
        checkOut: '12/04/2021',
        paidAmount: '0.00',
        dueAmount: '$430',
        paymentStatus:'Pending',
        statusBgColor:'text-bg-warning'
    },
    {   
        name:'Phil Glover',
        roomType:'Studio',
        checkIn:'11/04/2021',
        checkOut: '12/04/2021',
        paidAmount: '0.00',
        dueAmount: '$4450',
        paymentStatus:'Pending',
        statusBgColor:'text-bg-warning'
    },
    {   
        name:'Victor Rampling',
        roomType:'Junior Suite',
        checkIn:'28/04/2021',
        checkOut: '30/04/2021',
        paidAmount: '0.00',
        dueAmount: '$530',
        paymentStatus:'Pending',
        statusBgColor:'text-bg-warning'
    },
    {   
        name:'Sally Graham',
        roomType:'Queen',
        checkIn:'01/05/2021',
        checkOut: '06/05/2021',
        paidAmount: '$1550',
        dueAmount: '0.00',
        paymentStatus:'Success',
        statusBgColor:'text-bg-success'
    },
    {   
        name:' Robert Anderson',
        roomType:'Cabana',
        checkIn:'03/05/2021',
        checkOut: '06/05/2021',
        paidAmount: '0.00',
        dueAmount: '$1230',
        paymentStatus:'Pending',
        statusBgColor:'text-bg-warning'
    },
]