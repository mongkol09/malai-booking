import perfume from '../../../../../../assets/images/facility/perfume.png';
import vacuumCleaner from '../../../../../../assets/images/facility/vacuum-cleaner.png';
import wifi from '../../../../../../assets/images/facility/wifi.png';
import lamp from '../../../../../../assets/images/facility/lamp.png';

export const facilitesDetailsColumns = [
    {
      Header: 'Facilites Id',
      accessor: 'facilitesId',
    },
    {
      Header: 'Facilites Type',
      accessor: 'facilitesType',
    },
    {
      Header: 'Facilites Name',
      accessor: 'facilitesName',
    },
    {
      Header: 'Facilites Image',
      accessor: 'facilitesImage',
    },
    {
    Header: 'Actions',
    accessor: 'actions',
    }
];

export const facilitesDetailsData = [
    {   
        facilitesId:'1101',
        facilitesType:'Aroma',
        facilitesName:'Cairo Tate',
        facilitesImage: perfume,
        imgAlt: 'perfume'
    },
    {   
        facilitesId:'1102',
        facilitesType:'Cleanliness',
        facilitesName:'Ryan Rodgers',
        facilitesImage: vacuumCleaner,
        imgAlt: 'vacuumCleaner'
    },
    {   
        facilitesId:'1103',
        facilitesType:'Internet',
        facilitesName:'Wifi',
        facilitesImage: wifi,
        imgAlt: 'wifi'
    },
    {   
        facilitesId:'1104',
        facilitesType:'Lighting',
        facilitesName:'Auto Mation',
        facilitesImage: lamp,
        imgAlt: 'lamp'
    },
];