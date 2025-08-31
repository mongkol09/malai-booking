import visaCard from '../../../../../../../assets/images/payment/visa-card.svg';
import masterCard from '../../../../../../../assets/images/payment/mastercard.svg';
import paypal from '../../../../../../../assets/images/payment/paypal.svg';

export const invoiceReportColumns = [
    {
      Header: 'Invoice Number',
      accessor: 'invoiceNumber',
    },
    {
      Header: 'Clients',
      accessor: 'clients',
    },
    {
      Header: 'Date',
      accessor: 'date',
    },
    {
      Header: 'Paid By',
      accessor: 'paidBy',
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
    {
        Header: 'Amount',
        accessor: 'amount',
    },
  ];

  export const invoiceReportTableData = [
    {   
        invoiceNumber:'#LA-0220',
        clients:'iVince Tech Pvt Ltd',
        date: '17 Nov, 2022',
        paidBy: paypal,
        status: 'Pending',
        amount:'$5,205',
        statusColor:'bg-warning'
    },
    {   
        invoiceNumber:'#LA-0245',
        clients:'Altra Systems',
        date: '23 Feb, 2023',
        paidBy: visaCard,
        status: 'Approved',
        amount:'$2,000',
        statusColor:'bg-success'
    },
    {   
        invoiceNumber:'#LA-0246',
        clients:'Data Core Systems',
        date: '01 Jan, 2023',
        paidBy: paypal,
        status: 'Approved',
        amount:'$2,850',
        statusColor:'bg-success'
    },
    {   
        invoiceNumber:'#LA-0312',
        clients:'Vintage solutions',
        date: '07 May, 2022',
        paidBy: masterCard,
        status: 'Pending',
        amount:'$4,280',
        statusColor:'bg-warning'
    },
    {   
        invoiceNumber:'#LA-0348',
        clients:'Tritech Solutions Pvt Ltd',
        date: '25 Aug, 2022',
        paidBy: paypal,
        status: 'Pending',
        amount:'$1,025',
        statusColor:'bg-warning'
    },
    {   
        invoiceNumber:'#LA-0352',
        clients:'Unit India Systems',
        date: '15 March, 2023',
        paidBy: masterCard,
        status: 'Approved',
        amount:'$7,520',
        statusColor:'bg-success'
    },
    {   
        invoiceNumber:'#LA-0353',
        clients:'Megara IT Solutions',
        date: '08 Jan, 2023',
        paidBy: visaCard,
        status: 'Approved',
        amount:'$5,320',
        statusColor:'bg-success'
    },
    {   
        invoiceNumber:'#LA-0365',
        clients:'Logind Technologies',
        date: '25 March, 2022',
        paidBy: visaCard,
        status: 'Approved',
        amount:'$1,500',
        statusColor:'bg-success'
    },
]