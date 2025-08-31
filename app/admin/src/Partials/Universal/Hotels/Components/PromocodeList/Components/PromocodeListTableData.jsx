export const promocodeListColumns = [
    {
      Header: 'Room Id',
      accessor: 'roomId',
    },
    {
      Header: 'Room Type',
      accessor: 'roomType',
    },
    {
      Header: 'From',
      accessor: 'from',
    },
    {
      Header: 'To',
      accessor: 'to',
    },
    {
      Header: 'Discount',
      accessor: 'discount',
    },
    {
      Header: 'Promocode',
      accessor: 'promoCode',
    },
    {
        Header: 'Status',
        accessor: 'status',
    },
    {
      Header: 'Actions',
      accessor: 'actions',
    }
  ];

  export const promocodeListTableData = [
    {   
        roomId:'1101',
        roomType:'VIP-Guest',
        from:'11/01/2024',
        to: '21/01/2024',
        discount: '200',
        promoCode: 'flat-200',
        status:'Apply',
        statusBgColor:'text-bg-success'
    },
    {   
        roomId:'1102',
        roomType:'VIP',
        from:'11/01/2024',
        to: '12/01/2024',
        discount: '500',
        promoCode: 'flat-500',
        status:'Expire',
        statusBgColor:'text-bg-danger'
    },
    {   
        roomId:'1103',
        roomType:'Triple Room',
        from:'11/01/2024',
        to: '14/01/2024',
        discount: '300',
        promoCode: 'flat-300',
        status:'Expire',
        statusBgColor:'text-bg-danger'
    },
    {   
      roomId:'1104',
      roomType:'Executive Suite',
      from:'25/01/2024',
      to: '04/02/2024',
      discount: '250',
      promoCode: 'exec-250',
      status:'Expire',
      statusBgColor:'text-bg-danger'
    },
    {   
      roomId:'1105',
      roomType:'Single Room',
      from:'02/02/2024',
      to: '12/02/2024',
      discount: '100',
      promoCode: 'feb-100',
      status:'Expire',
      statusBgColor:'text-bg-danger'
    },
    {   
      roomId:'1106',
      roomType:'Double Room',
      from:'10/02/2024',
      to: '20/04/2024',
      discount: '150',
      promoCode: 'double-150',
      status:'Apply',
      statusBgColor:'text-bg-success'
    },
    {   
      roomId:'1107',
      roomType:'Family Suite',
      from:'15/02/2024',
      to: '25/06/2024',
      discount: '200',
      promoCode: 'family-200',
      status:'Apply',
      statusBgColor:'text-bg-success'
    },
    {   
      roomId:'1108',
      roomType:'Presidential Suite',
      from:'22/02/2024',
      to: '03/07/2024',
      discount: '300',
      promoCode: 'presi-300',
      status:'Apply',
      statusBgColor:'text-bg-success'
    },
    {   
      roomId:'1109',
      roomType:'Superior Room',
      from:'01/03/2024',
      to: '11/08/2024',
      discount: '120',
      promoCode: 'march-120',
      status:'Apply',
      statusBgColor:'text-bg-success'
    },
    {   
      roomId:'1110',
      roomType:'Luxury Suite',
      from:'08/03/2024',
      to: '18/09/2024',
      discount: '180',
      promoCode: 'lux-180',
      status:'Apply',
      statusBgColor:'text-bg-success'
    },
]