export var empAnalytics = {
    series: [{
        name: 'Available',
        data: [4, 19, 7, 35, 14, 27, 9, 12],
    }],
        chart: {
        height: 210,
        type: 'line',
        toolbar: {
            show: false,
        }
    },
    grid: {
        show: false,
        xaxis: {
            lines: {
                show: false
            }
        },   
        yaxis: { 
            lines: {
                show: false
            }
        }, 
    },
    stroke: {
        width: 4,
        curve: 'smooth',
        colors: ['var(--theme-color2)'],
    },
    xaxis: {
        type: 'datetime',
        categories: ['1/11/2021', '2/11/2021', '3/11/2021', '4/11/2021', '5/11/2021', '6/11/2021', '7/11/2021', '8/11/2021'],
        tickAmount: 10,
        labels: {
            formatter: function(value, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), 'dd MMM')
            }
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            gradientToColors: [ "var(--theme-color3)" ],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100],
        },
    },
    markers: {
        size: 3,
        colors: ["#FFA41B"],
        strokeColors: "#ffffff",
        strokeWidth: 2,
        hover: {
            size: 7,
        }
    },
    yaxis: {
        show: false,
        min: -10,
        max: 50,
    }
};