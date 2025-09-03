import { bill, food, utility, shopping } from "./TransactionChart"
export const transactionData = [
    {
        icon:'fa fa-cc-mastercard',
        title:'Bill',
        amount:'$2,500.00',
        textColor:'theme-text-color1',
        options:bill,
        series:bill.series
    },
    {
        icon:'fa fa-cutlery',
        title:'Food',
        amount:'$22,300.00',
        textColor:'theme-text-color2',
        options:food,
        series:food.series
    },
    {
        icon:'fa fa-cc-mastercard',
        title:'Utility',
        amount:'$730.00',
        textColor:'theme-text-color3',
        options:utility,
        series:utility.series
    },
    {
        icon:'fa fa-shopping-basket',
        title:'Shopping',
        amount:'$5,500.00',
        textColor:'theme-text-color4',
        options:shopping,
        series:shopping.series
    },
]

export const transactionColumns = [
    {
      Header: () => (
        <input className="form-check-input select-all" type="checkbox" defaultValue=""/>
      ),
      accessor: 'checkbox', 
    },
    {
      Header: 'Product Description',
      accessor: 'productDescription',
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
    {
      Header: 'Price',
      accessor: 'price',
    },
    {
      Header: 'Order No.',
      accessor: 'orderNo',
    },
    {
      Header: 'Order Total',
      accessor: 'orderTotal',
    },
    {
      Header: 'Action',
      accessor: 'action',
    },
  ];

  export const transactionTableData = [
    {
        description:'Gas Bill Payment',
        status:'Your order is successful',
        price:'$500.00',
        order_no:'B-123123',
        time:'22 5:08 pm',
        order_total:'$500.00'
    },
    {
        description:'Electricity Bill',
        status:'Successful',
        price:'$1000.00',
        order_no:'M-123123',
        time:'22 5:08 pm',
        order_total:'$1000.00'
    },
    {
        description:'Hotel Tax Bill',
        status:'Booking Confirmed',
        price:'$46.00',
        order_no:'A-123123',
        time:'22 5:08 pm',
        order_total:'$46.00'
    },
    {
        description:'Hotel Tv Recharge',
        status:'Recharge successful',
        price:'$99.90',
        order_no:'R-123123',
        time:'22 5:08 pm',
        order_total:'$99.90'
    },
    {
        description:'Malai Pharmacy',
        status:'Your order is successful',
        price:'$122.00',
        order_no:'B-123123',
        time:'22 5:08 pm',
        order_total:'$122.00'
    },
    {
        description:'Gas Bill Payment',
        status:'Your order is successful',
        price:'$500.00',
        order_no:'B-123125',
        time:'22 5:08 pm',
        order_total:'$500.00'
    },
    {
        description:'Electricity Bill',
        status:'Successful',
        price:'$1000.00',
        order_no:'B-123126',
        time:'22 5:08 pm',
        order_total:'$1000.00'
    },
    {
        description:'Hotel Tax Bill',
        status:'Booking Confirmed',
        price:'$46.00',
        order_no:'E-123124',
        time:'22 5:08 pm',
        order_total:'$46.00'
    },
    {
        description:'Hotel Tv Recharge',
        status:'Recharge successful',
        price:'$99.90',
        order_no:'R-123225',
        time:'22 5:08 pm',
        order_total:'$99.90'
    },
    {
        description:'Malai Pharmacy',
        status:'Your order is successful',
        price:'$122.00',
        order_no:'B-123124',
        time:'22 5:08 pm',
        order_total:'$122.00'
    },

]
