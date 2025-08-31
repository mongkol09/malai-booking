import visaCard from '../../../../../../../assets/images/payment/visa-card.svg';
import masterCard from '../../../../../../../assets/images/payment/mastercard.svg';
import paypal from '../../../../../../../assets/images/payment/paypal.svg';

export const expenseReportColumns = [
    {
      Header: 'Item',
      accessor: 'item',
    },
    {
      Header: 'Order By',
      accessor: 'orderBy',
    },
    {
      Header: 'From',
      accessor: 'from',
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

  export const expenseReportTableData = [
    {   
        item:'Lenovo Monitor 24 inch',
        orderBy:'Kevin Glover',
        from:'Amazon India',
        date: '16 Dec, 2022',
        paidBy: visaCard,
        status: 'Pending',
        amount:'$135',
        statusColor:'bg-warning'
    },
    {   
        item:'Mi LED Smart TV 4A 80',
        orderBy:'Julia Bower',
        from:'Mi Website',
        date: '23 Jan, 2023',
        paidBy: visaCard,
        status: 'Approved',
        amount:'$312',
        statusColor:'bg-success'
    },
    {   
        item:'Airtel DG-HR3400 Router',
        orderBy:'Sebastian Black',
        from:'Amazon India',
        date: '01 Feb, 2023',
        paidBy: masterCard,
        status: 'Approved',
        amount:'$250',
        statusColor:'bg-success'
    },
    {   
        item:'HP 200 Mouse & Wireless Laptop Keyboard',
        orderBy:'David Wallace',
        from:'Flipkart',
        date: '28 April, 2022',
        paidBy: paypal,
        status: 'Pending',
        amount:'$80',
        statusColor:'bg-warning'
    },
    {   
        item:'Lenovo Monitor 24 inch',
        orderBy:'Kevin Glover',
        from:'Amazon India',
        date: '16 Dec, 2022',
        paidBy: visaCard,
        status: 'Pending',
        amount:'$135',
        statusColor:'bg-warning'
    },
    {   
        item:'Mi LED Smart TV 4A 80',
        orderBy:'Julia Bower',
        from:'Mi Website',
        date: '23 Jan, 2023',
        paidBy: visaCard,
        status: 'Approved',
        amount:'$312',
        statusColor:'bg-success'
    },
]