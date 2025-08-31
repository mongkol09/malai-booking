import React from 'react';
import '../../PeityCharts/Components/chartStyle.css'

const CommonLineChart = ({ data }) => {
  const chartWidth = 40;
  const chartHeight = 20;

  const maxData = Math.max(...data);
  const scaleFactor = chartHeight / maxData;

  const chartPoints = data.map((value, index) => `${index * (chartWidth / (data.length - 1))},${chartHeight - value * scaleFactor}`).join(' ');

  return (
    <svg className='small-line-chart' width={chartWidth} height={chartHeight}>
      <polyline points={chartPoints} fill="none" stroke="blue" strokeWidth="1" />
    </svg>
  );
};

export default CommonLineChart;
