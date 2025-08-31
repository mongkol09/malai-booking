import avatar1 from '../../../../../assets/images/xs/avatar1.jpg'
import avatar2 from '../../../../../assets/images/xs/avatar2.jpg'
import avatar3 from '../../../../../assets/images/xs/avatar3.jpg'
import avatar4 from '../../../../../assets/images/xs/avatar4.jpg'
import avatar5 from '../../../../../assets/images/xs/avatar5.jpg'
import avatar6 from '../../../../../assets/images/xs/avatar6.jpg'

export const invoiceColumn = [
    {
        Header: '#',
        accessor: '#',
      },
      {
        Header: 'Client Name',
        accessor: 'clientName',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
      }
]

export const invoiceTableData = [
    {
        "Id": "#M0001",
        "clientName": "South Shyanne",
        "email": "south.shyanne@info.com",
        "amount": "$1200",
        "status": "Done",
        "statusColor": "bg-success",
        "avatar": avatar1,
      },
      {
        "Id": "#M0002",
        "clientName": "Zoe Baker",
        "email": "zoe.baker@info.com",
        "amount": "$378",
        "status": "Done",
        "statusColor": "bg-success",
        "avatar": avatar2,
      },
      {
        "Id": "#M0003",
        "clientName": "Colin Brown",
        "email": "colinbrown@info.com",
        "amount": "$653",
        "status": "Done",
        "statusColor": "bg-success",
        "avatar": avatar3,
      },
      {
        "Id": "#M0004",
        "clientName": "Kevin Gill",
        "email": "kevin.gill@info.com",
        "amount": "$451",
        "status": "Panding",
        "statusColor": "bg-warning",
        "avatar": avatar4,
      },
      {
        "Id": "#M0005",
        "clientName": "Maria Gill",
        "email": "Maria.gill@info.com",
        "amount": "$1,989",
        "status": "Done",
        "statusColor": "bg-success",
        "avatar": avatar5,
      },
      {
        "Id": "#M0006",
        "clientName": "Kevin Baker",
        "email": "kevin.baker@info.com",
        "amount": "$343",
        "status": "Panding",
        "statusColor": "bg-warning",
        "avatar": avatar6,
      },
      {
        "Id": "#M0007",
        "clientName": "Colin Brown",
        "email": "colin-brown@info.com",
        "amount": "$653",
        "status": "Done",
        "statusColor": "bg-success",
        "avatar": avatar3,
      },
      {
        "Id": "#M0008",
        "clientName": "Kevin Gill",
        "email": "kevin-gill@info.com",
        "amount": "$451",
        "status": "Panding",
        "statusColor": "bg-warning",
        "avatar": avatar4,
      }
]