import gallery1 from '../../../../../assets/images/gallery/1.jpg';
import gallery2 from '../../../../../assets/images/gallery/2.jpg';
import gallery3 from '../../../../../assets/images/gallery/3.jpg';
import gallery4 from '../../../../../assets/images/gallery/4.jpg';
import gallery5 from '../../../../../assets/images/gallery/5.jpg';

export const roomImagesColumn = [
    {
        Header: 'Room Id',
        accessor: 'roomId',
    },
    {
        Header: 'Room Type',
        accessor: 'roomType',
    },
    {
        Header: 'Room Images',
        accessor: 'roomImages',
    },
    {
        Header: 'Actions',
        accessor: 'actions',
    }
]

export const roomImagesTableData = [
    {
        "roomId": "1101",
        "roomType": "King Bed",
        "roomImages": gallery1,
    },
    {
        "roomId": "1102",
        "roomType": "VIP",
        "roomImages": gallery2,
    },
    {
        "roomId": "1103",
        "roomType": "Triple Room",
        "roomImages": gallery3,
    },
    {
        "roomId": "1104",
        "roomType": "Single Room",
        "roomImages": gallery4,
    },
    {
        "roomId": "1105",
        "roomType": "Twin Room",
        "roomImages": gallery5,
    }
]