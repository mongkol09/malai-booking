import avatar1 from '../../../../../../assets/images/xs/avatar1.jpg';
import avatar2 from '../../../../../../assets/images/xs/avatar2.jpg';
import avatar3 from '../../../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../../../assets/images/xs/avatar4.jpg';
import avatar5 from '../../../../../../assets/images/xs/avatar5.jpg';
import avatar6 from '../../../../../../assets/images/xs/avatar6.jpg';

export const empDepartmentsColumns = [
    {
      Header: '#',
      accessor: 'id',
    },
    {
      Header: 'Department Head',
      accessor: 'departmentHead',
    },
    {
      Header: 'Department Name',
      accessor: 'departmentName',
    },
    {
      Header: 'Employee UnderWork',
      accessor: 'employeeUnderWork',
    },
    {
      Header: 'Actions',
      accessor: 'actions',
    }
  ];

  export const empDepartmentsTableData = [
    {   
        id:'1',
        departmentHead:'Joan Dyer',
        headImg: avatar1,
        departmentName: 'Housekeeping Staff',
        employeeUnderWork: '40',
    },
    {   
        id:'2',
        departmentHead:'Ryan Randall',
        headImg: avatar2,
        departmentName: 'Accounts',
        employeeUnderWork: '48',
    },
    {   
        id:'3',
        departmentHead: 'Phil Glover',
        headImg: avatar3,
        departmentName: 'Support',
        employeeUnderWork: '15',
    },
    {   
        id:'4',
        departmentHead: 'Victor Rampling',
        headImg: avatar4,
        departmentName: 'Manager',
        employeeUnderWork: '39',
    },
    {   
        id:'5',
        departmentHead: 'Sally Graham',
        headImg: avatar5,
        departmentName: 'Recruiter',
        employeeUnderWork: '12',
    },
    {   
        id:'6',
        departmentHead: 'Robert Anderson',
        headImg: avatar6,
        departmentName: 'Admin',
        employeeUnderWork: '8',
    },
]