import React, { useEffect, useRef } from 'react';

const GooglePieChart = ({ data, title, colors, is3D = true, pieHole }) => {
  const chartRef = useRef(null);
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const drawChart = () => {
      if (!window.google || !window.google.visualization) {
        console.error("Google Charts library not loaded.");
        return;
      }
      const chartData = google.visualization.arrayToDataTable([
        ['Task Status', 'Count'],
        ...data.map(item => [item.name, item.value])
      ]);

      const options = {
        title: title,
        is3D: is3D,
        pieHole: pieHole,
        backgroundColor: 'transparent',
        legend: {
          textStyle: { color: isDarkMode ? '#E2E8F0' : '#334155' }
        },
        chartArea: { left: 10, top: 20, width: '90%', height: '90%' },
        titleTextStyle: { color: isDarkMode ? '#E2E8F0' : '#334155' },
        colors: colors ? data.map(item => colors[item.name]) : undefined,
      };

      if (chartRef.current) {
        const chart = new google.visualization.PieChart(chartRef.current);
        chart.draw(chartData, options);
      }
    };

    if (window.google && window.google.charts) {
      google.charts.load('current', { packages: ['corechart'] });
      google.charts.setOnLoadCallback(drawChart);
    } else {
      // Fallback to load the script if it's not already there
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = () => {
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);
      };
      document.head.appendChild(script);
    }
  }, [data, title, colors, is3D, pieHole, isDarkMode]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default GooglePieChart;