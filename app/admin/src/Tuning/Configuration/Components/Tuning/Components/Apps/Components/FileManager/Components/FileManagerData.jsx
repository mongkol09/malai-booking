import avatar1 from '../../../../../../../../../assets/images/xs/avatar1.jpg';
import avatar2 from '../../../../../../../../../assets/images/xs/avatar2.jpg';
import avatar3 from '../../../../../../../../../assets/images/xs/avatar3.jpg';
import avatar4 from '../../../../../../../../../assets/images/xs/avatar4.jpg';

export const fileManagercolumns = [
    { Header: '', accessor: 'folder'},
    { Header: 'Name', accessor: 'name' },
    { Header: 'Share With', accessor: 'shareWith' },
    { Header: 'Owner', accessor: 'owner' },
    { Header: 'Last Update', accessor: 'lastUpdate' },
    { Header: 'Size', accessor: 'size' },
  ];

export const FolderData = [
    {
        theme_color: 'var(--theme-color1)',
        title: 'Analytics',
        file_size: '215 File, 50MB'
    },
    {
        theme_color: 'var(--theme-color2)',
        title: 'Assets',
        file_size: '215 File, 50MB'
    },
    {
        theme_color: 'var(--theme-color3)',
        title: 'Marketing',
        file_size: '215 File, 50MB'
    },
    {
        theme_color: 'var(--theme-color4)',
        title: 'New App Design',
        file_size: '215 File, 50MB'
    }
]

export const AccessFileData = [
    {
        file_folder:'fa fa-folder',
        theme_color:'',
        name: 'Work',
        share_with: [avatar1, avatar2, avatar3],
        owner: 'Me',
        last_update: 'Oct 7, 2020',
        size: '-'
    },
    {
        file_folder:'fa fa-folder',
        theme_color:'',
        name: 'Family',
        share_with: [],
        owner: 'Me',
        last_update: 'Oct 17, 2020',
        size: '-'
    },
    {
        file_folder:'fa fa-folder',
        theme_color:'theme-text-color1',
        name: 'Holidays',
        share_with: [],
        owner: 'Jony',
        last_update: 'Oct 18, 2020',
        size: '50MB'
    },
    {
        file_folder:'fa fa-folder',
        theme_color:'',
        name: 'Mobile Work',
        share_with: [],
        owner: 'Me',
        last_update: 'April 7, 2021',
        size: '1GB'
    },
    {
        file_folder:'fa fa-folder',
        theme_color:'theme-text-color3',
        name: 'Photoshop Data',
        share_with: [avatar1, avatar2],
        owner: 'Andrew',
        last_update: 'Nov 23, 2021',
        size: '-'
    },
    {
        file_folder:'fa fa-folder',
        theme_color:'theme-text-color6',
        name: 'Holidays',
        share_with: [avatar1, avatar2, avatar3, avatar4],
        owner: 'Me',
        last_update: 'Dec 5, 2020',
        size: '100MB'
    },
    {
        file_folder:'fa fa-file-excel-o',
        theme_color:'text-success',
        name: 'new timesheet.xlsx',
        share_with: [],
        owner: 'Me',
        last_update: 'Dec 5, 2020',
        size: '52KB'
    },
    {
        file_folder:'fa fa-file-word-o',
        theme_color:'text-info',
        name: 'new project.doc',
        share_with: [],
        owner: 'Me',
        last_update: 'Dec 5, 2021',
        size: '152KB'
    },
    {
        file_folder:'fa fa-file-pdf-o',
        theme_color:'text-warning',
        name: 'report.pdf',
        share_with: [],
        owner: 'Me',
        last_update: 'May 2, 2021',
        size: '841KB'
    },
    {
        file_folder:'fa fa-file-pdf-o',
        theme_color:'text-warning',
        name: 'report-2020.pdf',
        share_with: [],
        owner: 'Me',
        last_update: 'Oct 16, 2020',
        size: '541KB'
    },
]