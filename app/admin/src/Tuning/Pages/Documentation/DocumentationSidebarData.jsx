import DocIndex from './DocIndex/DocIndex'
import BasicCard from './Widgets/BasicCard';
import CardTiles from './Widgets/CardTiles';
import CardTab from './Widgets/CardTab';
import Tables from './Widgets/Tables';
import Forms from './Widgets/Forms';
import ApexCharts from './Charts/ApexCharts/ApexCharts';
import PeityCharts from './Charts/PeityCharts/PeityCharts';
import DataTables from './Plugins/DataTables/DataTables';
import Flatpickrc from './Plugins/Flatpickr/Flatpickr';
import InputmaskPlugin from './Plugins/Inputmask/InputmaskPlugin';
import Jsvectormap from './Plugins/Jsvectormap/Jsvectormap';
import SortableJS from './Plugins/SortableJS/SortableJS';
import Sweetalert2 from './Plugins/Sweetalert2/Sweetalert2';
import TagifyC from './Plugins/Tagify/Tagify';
import Tinyslider from './Plugins/Tinyslider/Tinyslider';
import ToastUICalendar from './Plugins/ToastUICalendar/ToastUICalendar';
import Summernote from './Plugins/Summernote/Summernote';
import BootstrapIcon from './FontIcon/BootstrapIcon/BootstrapIcon';
import CountryFlagsIcon from './FontIcon/CountryFlagsIcon/CountryFlagsIcon';
import FontawesomeIcon from './FontIcon/FontawesomeIcon/FontawesomeIcon';
import LinearIcon from './FontIcon/LinearIcon/LinearIcon';
import WeatherIcon from './FontIcon/WeatherIcon/WeatherIcon';
import Accordion from './BootstrapUI/Accordion/Accordion';
import Alerts from './BootstrapUI/Alerts/Alerts';
import UserAvatar from './BootstrapUI/UserAvatar/UserAvatar';
import Badges from './BootstrapUI/Badges/Badges';
import Breadcrumb from './BootstrapUI/Breadcrumb/Breadcrumb';
import Buttons from './BootstrapUI/Buttons/Buttons';
import Cards from './BootstrapUI/Cards/Cards';
import Carousel from './BootstrapUI/Carousel/Carousel';
import Collapse from './BootstrapUI/Collapse/Collapse';
import Dropdowns from './BootstrapUI/Dropdowns/Dropdowns';
import Listgroup from './BootstrapUI/Listgroup/Listgroup';
import Modal from './BootstrapUI/Modal/Modal';
import Navbar from './BootstrapUI/Navbar/Navbar';
import Navstabs from './BootstrapUI/Navstabs/Navstabs';
import Offcanvas from './BootstrapUI/Offcanvas/Offcanvas';
import Pagination from './BootstrapUI/Pagination/Pagination';
import Placeholders from './BootstrapUI/Placeholders/Placeholders';
import PopoversContent from './BootstrapUI/Popovers/PopoversContent';
import Progressbar from './BootstrapUI/Progressbar/Progressbar';
import Spinners from './BootstrapUI/Spinners/Spinners';
import Toasts from './BootstrapUI/Toasts/Toasts';

export const generalTitleMapping = {
    // General
    "/docs": "Index",
    "/docs/widgets-basic-card": "BasicCard",
    "/docs/widgets-card-tiles": "CardTiles",
    "/docs/widgets-card-tab": "CardTab",
    "/docs/widgets-tables": "Tables",
    "/docs/widgets-forms": "Forms",
    "/docs/apex": "ApexChart",
    "/docs/peity": "PeityChart",
    "/docs/datatables": "DataTable",
    "/docs/flatpickr": "Flatpickr",
    "/docs/inputmask": "Inputmask",
    "/docs/jsvectormap": "Jsvectormap",
    "/docs/sortablejs": "Sortablejs",
    "/docs/sweetalert2": "Sweetalert2",
    "/docs/tagify": "Tagify",
    "/docs/tiny-slider": "TinySlider",
    "/docs/full-calendar": "Calendar",
    "/docs/summernote": "Summernote",
    "/docs/bootstrap-icon": "BootstrapIcon",
    "/docs/flag-icon": "FlagIcon",
    "/docs/fontawesome-icon": "FontawesomeIcon",
    "/docs/linear-icon": "LinearIcon",
    "/docs/weather-icon": "WeatherIcon",
}
export const bootstrapTitleMapping = {
    // Bootstrap
    "/docs/accordion": "Accordion",
    "/docs/alerts": "Alerts",
    "/docs/avatar": "Avatar",
    "/docs/badges": "Badges",
    "/docs/breadcrumb": "Breadcrumb",
    "/docs/buttons": "Buttons",
    "/docs/cards": "Cards",
    "/docs/carousel": "Carousel",
    "/docs/collapse": "Collapse",
    "/docs/dropdowns": "Dropdowns",
    "/docs/listgroup": "Listgroup",
    "/docs/modal": "ModalPopup",
    "/docs/navbar": "Navbar",
    "/docs/navstabs": "NavsTabs",
    "/docs/offcanvas": "Offcanvas",
    "/docs/pagination": "Pagination",
    "/docs/placeholders": "Placeholders",
    "/docs/popovers": "Popovers",
    "/docs/progress": "Progressbar",
    "/docs/spinners": "Spinners",
    "/docs/toasts": "Toasts",
};

export const docComponents = {
    Index: <DocIndex />,
    BasicCard: <BasicCard />,
    CardTiles: <CardTiles />,
    CardTab: <CardTab />,
    Tables: <Tables />,
    Forms: <Forms />,
    ApexChart: <ApexCharts />,
    PeityChart: <PeityCharts />,
    DataTable: <DataTables />,
    Flatpickr: <Flatpickrc />,
    Inputmask: <InputmaskPlugin />,
    Jsvectormap: <Jsvectormap />,
    Sortablejs: <SortableJS />,
    Sweetalert2: <Sweetalert2 />,
    Tagify: <TagifyC />,
    TinySlider: <Tinyslider />,
    Calendar: <ToastUICalendar />,
    Summernote: <Summernote />,
    BootstrapIcon: <BootstrapIcon />,
    FlagIcon: <CountryFlagsIcon />,
    FontawesomeIcon: <FontawesomeIcon />,
    LinearIcon: <LinearIcon />,
    WeatherIcon: <WeatherIcon />,

    // Bootstrap
    Accordion: <Accordion />,
    Alerts: <Alerts />,
    Avatar: <UserAvatar />,
    Badges: <Badges />,
    Breadcrumb: <Breadcrumb />,
    Buttons: <Buttons />,
    Cards: <Cards />,
    Carousel: <Carousel />,
    Collapse: <Collapse />,
    Dropdowns: <Dropdowns />,
    Listgroup: <Listgroup />,
    ModalPopup: <Modal />,
    Navbar: <Navbar />,
    NavsTabs: <Navstabs />,
    Offcanvas: <Offcanvas />,
    Pagination: <Pagination />,
    Placeholders: <Placeholders />,
    Popovers: <PopoversContent />,
    Progressbar: <Progressbar />,
    Spinners: <Spinners />,
    Toasts: <Toasts />,
};