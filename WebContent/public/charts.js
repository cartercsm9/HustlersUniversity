// Define the Utils object with colors and a method to transparentize colors
const Utils = {
    CHART_COLORS: {
        red: 'rgb(255, 99, 132)',
        blue: 'rgb(54, 162, 235)',
        green: 'rgb(75, 192, 192)',
        pink: 'rgb(255, 192, 203)'
    },
    transparentize: (color, opacity) => {
        let alpha = opacity === undefined ? 0.5 : 1 - opacity;
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
};

// Separate data objects for each chart
const tempData = {
    labels: [],
    datasets: [{
        label: 'Temperature',
        data: [],
        borderColor: Utils.CHART_COLORS.red,
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    }]
};

const humidityData = {
    labels: [],
    datasets: [{
        label: 'Humidity',
        data: [],
        borderColor: Utils.CHART_COLORS.pink,
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.pink, 0.5),
    }]
};

const windSpeedData = {
    labels: [],
    datasets: [{
        label: 'Wind Speed',
        data: [],
        borderColor: Utils.CHART_COLORS.green,
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green, 0.5),
    }]
};

const tempChart = new Chart("tempChart", {
    type: 'line',
    data: tempData,
    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false
          },
        scales: {
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Temperature (°C)'
                }
            }
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true}
        }
    }
});


const humidityChart = new Chart("humidityChart", {
    type: 'line',
    data: humidityData,
    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false
          },
        scales: {
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Percent (%)'
                }
            }
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true }
        }
    }
});

const windSpeedChart = new Chart("windSpeedChart", {
    type: 'line',
    data: windSpeedData,
    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false
          },
        scales: {
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'kilometers per hour(kph)'
                }
            }
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true }
        }
    }
});

async function chartQuery() {
    try {
        const cityName1 = document.getElementById('location1').value;
        const cityName2 = document.getElementById('location2').value;

        const city1Data = await fetchData(cityName1);
        const city2Data = cityName2 ? await fetchData(cityName2) : [];

        const allDates = getAllDates(city1Data, city2Data);

        // Initialize or update charts for temperature, humidity, and wind speed
        updateChartForCity(tempChart, allDates, city1Data, city2Data, cityName1, cityName2, 'temperature', Utils.CHART_COLORS);
        updateChartForCity(humidityChart, allDates, city1Data, city2Data, cityName1, cityName2, 'humidity', Utils.CHART_COLORS);
        updateChartForCity(windSpeedChart, allDates, city1Data, city2Data, cityName1, cityName2, 'wind_speed', Utils.CHART_COLORS);
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
    }
}

async function fetchData(cityName) {
    if (!cityName) return [];
    const response = await fetch(`/weather/queryHistoryByCity?cityName=${encodeURIComponent(cityName)}`);
    return response.ok ? await response.json() : [];
}

function getAllDates(city1Data, city2Data) {
    const allDates = new Set([
        ...city1Data.map(item => item.forecast_date.split('T')[0]),
        ...city2Data.map(item => item.forecast_date.split('T')[0])
    ]);
    return Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
}

function updateChartForCity(chart, allDates, city1Data, city2Data, cityName1, cityName2, dataType, colors) {
    const color1 = colors.red;
    const color2 = colors.blue;

    initOrUpdateChart(chart, allDates, city1Data, cityName1, color1, 0, dataType);
    if (city2Data.length > 0) {
        initOrUpdateChart(chart, allDates, city2Data, cityName2, color2, 1, dataType);
    }
}

function initOrUpdateChart(chart, allDates, cityData, cityLabel, color, datasetIndex, dataType) {
    const dataMap = new Map(cityData.map(item => [item.forecast_date.split('T')[0], item[dataType]]));
    const data = allDates.map(date => dataMap.get(date) || null);

    if (chart.data.datasets[datasetIndex]) {
        chart.data.datasets[datasetIndex].data = data;
        chart.data.datasets[datasetIndex].label = cityLabel;
    } else {
        chart.data.datasets.push({
            label: cityLabel,
            data: data,
            borderColor: color,
            backgroundColor: Utils.transparentize(color, 0.5),
        });
    }

    chart.data.labels = allDates;
    chart.update();
}
