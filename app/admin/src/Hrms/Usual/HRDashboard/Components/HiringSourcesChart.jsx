export var hiringSources = {
    series: [{
        name: 'Master Safe',
        data: [45, 25, 44, 23, 25, 41, 32, 25, 22, 65, 22, 29]
    }, {
        name: 'Manager',
        data: [45, 12, 25, 22, 19, 22, 29, 23, 23, 25, 41, 32]
    }, {
        name: 'BarTender',
        data: [45, 25, 32, 25, 22, 65, 44, 23, 25, 41, 22, 29]
    }, {
        name: 'Housekeeping Staff',
        data: [32, 25, 22, 11, 22, 29, 16, 25, 9, 23, 25, 13]
    }],
    chart: {
        type: 'bar',
        height: 320,
        stacked: true,
        toolbar: {
            show: false
        },
        zoom: {
            enabled: true
        }
    },
    colors: ['var(--theme-color1)','var(--theme-color2)','var(--theme-color3)','var(--theme-color4)'],
    responsive: [{
        breakpoint: 480,
        options: {
            legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0
            }
        }
    }],
    xaxis: {
        categories: ['Jan','Feb','March','Apr','May','Jun','July','Aug','Sept','Oct','Nov','Dec'],
    },
    legend: {
        position: 'top', // top, bottom
        horizontalAlign: 'right', // left, right
    },
    dataLabels: {
        enabled: false,
    },
    fill: {
        opacity: 1
    }
};