import avatar1 from '../../../../../../assets/images/xs/avatar1.jpg';
import avatar2 from '../../../../../../assets/images/xs/avatar2.jpg';
import avatar3 from '../../../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../../../assets/images/xs/avatar4.jpg';
import avatar5 from '../../../../../../assets/images/xs/avatar5.jpg';
import avatar6 from '../../../../../../assets/images/xs/avatar6.jpg';
import avatar7 from '../../../../../../assets/images/xs/avatar7.jpg';
import avatar8 from '../../../../../../assets/images/xs/avatar8.jpg';
import avatar9 from '../../../../../../assets/images/xs/avatar9.jpg';
import avatar10 from '../../../../../../assets/images/xs/avatar10.jpg';

export const leaveRequestColumns = [
    {
      Header: 'Employee Id',
      accessor: 'empId',
    },
    {
      Header: 'Employee Name',
      accessor: 'employeeName',
    },
    {
      Header: 'Leave Type',
      accessor: 'leaveType',
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
      Header: 'Reason',
      accessor: 'reason',
    },
    {
      Header: 'Actions',
      accessor: 'actions',
    }
  ];

export const leaveRequestTableData = [
    {   
        empId:'#EMP : 00001',
        employeeName:'Frank Baker',
        leaveType:'Casual Leave',
        from: '12/03/2021',
        to: '14/03/2021',
        reason: 'Going to Holiday',
        empImg: avatar1,
    },
    {   
        empId:'#EMP : 00038',
        employeeName:'Ryan	Randall',
        leaveType:'Casual Leave',
        from: '11/04/2021',
        to: '12/04/2021',
        reason: 'Going to Holiday',
        empImg: avatar2,
    },
    {   
        empId:'#EMP : 00007',
        employeeName:'Phil	Glover',
        leaveType:'Medical Leave',
        from: '11/04/2021',
        to: '12/04/2021',
        reason: 'Going to Hospital',
        empImg: avatar3,
    },
    {   
        empId:'#EMP : 00010',
        employeeName:'Victor Rampling',
        leaveType:'Medical Leave',
        from: '28/04/2021',
        to: '30/04/2021',
        reason: 'Going to Hospital',
        empImg: avatar4,
    },
    {   
        empId:'#EMP : 00002',
        employeeName:'Victor Rampling',
        leaveType:'Medical Leave',
        from: '01/05/2021',
        to: '06/05/2021',
        reason: 'Hospital Admit',
        empImg: avatar5,
    },
    {   
        empId:'#EMP : 00005',
        employeeName:'Robert Anderson',
        leaveType:'Medical Leave',
        from: '03/05/2021',
        to: '06/05/2021',
        reason: 'Hospital Admit',
        empImg: avatar6,
    },
    {   
        empId:'#EMP : 00014',
        employeeName:'Ryan	Stewart',
        leaveType:'Casual Leave',
        from: '10/07/2021',
        to: '18/08/2021',
        reason: 'Family Holiday',
        empImg: avatar7,
    },
    {   
        empId:'#EMP : 00017',
        employeeName:'Joan Dyer',
        leaveType:'Casual Leave',
        from: '12/03/2021',
        to: '14/03/2021',
        reason: 'Going to Holiday',
        empImg: avatar8,
    },
    {   
        empId:'#EMP : 00022',
        employeeName:'Liam Berry',
        leaveType:'Casual Leave',
        from: '11/04/2021',
        to: '12/04/2021',
        reason: 'Going to Holiday',
        empImg: avatar9,
    },
    {   
        empId:'#EMP : 00016',
        employeeName:'Dean Otto',
        leaveType:'Medical Leave',
        from: '11/04/2021',
        to: '12/04/2021',
        reason: 'Going to Hospital',
        empImg: avatar10,
    } 
]

export const personalInfo = [
    {
    "Nationality": "Indian",
    "Religion": "Hindu",
    "Marital Status": "Married",
    "Passport No.": "5468953210",
    "Emergency Contact": "7468953210",
    }
]

export const bankInfo = [
    {
    "Bank Name": "Kotak",
    "Account No.": "5436874596325486",
    "IFSC Code": "Kotak000021",
    "Pan No": "ACQPF6584L",
    "UPI Id": "454812kotak@upi",
    }
]