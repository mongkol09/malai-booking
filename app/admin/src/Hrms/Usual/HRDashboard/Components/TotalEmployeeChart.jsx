export var totalEmp = {
    align: 'center',
    chart: {
        height: 230,
        type: 'donut',
        align: 'center',
    },
    labels: ['Man', 'Women'],
    dataLabels: {
        enabled: false,
    },
    legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        show: true,
    },
    colors: ['var(--theme-color4)', 'var(--theme-color3)'],
    series: [44, 55],
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
}