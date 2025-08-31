import avatar1 from '../../../../assets/images/xs/avatar1.jpg';
import avatar2 from '../../../../assets/images/xs/avatar2.jpg';
import avatar3 from '../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../assets/images/xs/avatar4.jpg';
import avatar5 from '../../../../assets/images/xs/avatar5.jpg';
import avatar6 from '../../../../assets/images/xs/avatar6.jpg';

export const empLoanColumns = [
    {
      Header: 'Employee ID',
      accessor: 'employeeID',
    },
    {
      Header: 'Employee Name',
      accessor: 'employeeName',
    },
    {
      Header: 'Date',
      accessor: 'date',
    },
    {
      Header: 'Loan Amount',
      accessor: 'loanAmount',
    },
    {
      Header: 'Loan Period',
      accessor: 'loanPeriod',
    }
  ];

  export const empLoanTableData = [
    {   
        employeeID:'LP-0101',
        employeeName:'Joan Dyer',
        empImg: avatar1,
        purpose: 'for weddings and family functions',
        date:'14 Jan, 2022',
        loanAmount: '$4000',
    },
    {   
        employeeID:'LP-0102',
        employeeName:'Ryan	Randall',
        empImg: avatar2,
        purpose: 'for home purchase, renovations and refurbishing',
        date:'09 Feb, 2022',
        loanAmount: '$6000',
    },
    {   
        employeeID:'LP-0103',
        employeeName:'Phil	Glover',
        empImg: avatar3,
        purpose: 'for weddings and family functions',
        date:'17 Mar, 2022',
        loanAmount: '$6200',
    },
    {   
        employeeID:'LP-0104',
        employeeName:'Victor Rampling',
        empImg: avatar4,
        purpose: 'for weddings and family functions',
        date:'09 Apr, 2022',
        loanAmount: '$16000',
    },
    {   
        employeeID:'LP-0105',
        employeeName:'Sally Graham',
        empImg: avatar5,
        purpose: 'for any medical emergencies',
        date:'09 Jun, 2022',
        loanAmount: '$10000',
    },
    {   
        employeeID:'LP-0106',
        employeeName:'Robert Anderson',
        empImg: avatar6,
        purpose: 'to provide for child’s education',
        date:'01 Oct, 2022',
        loanAmount: '$12000',
    }
]