// Define the Utils object with colors and a method to transparentize colors
const Utils = {
    CHART_COLORS: {
        red: 'rgb(255, 99, 132)',
        blue: 'rgb(54, 162, 235)',
        green: 'rgb(75, 192, 192)'
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
        borderColor: Utils.CHART_COLORS.blue,
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
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

        console.log(`Displaying data for ${cityName1}`);
        let queryResponse = await fetch(`/weather/queryHistoryByCity?cityName=${encodeURIComponent(cityName1)}`);
        let weatherData = await queryResponse.json();
        if (!queryResponse.ok || weatherData.length === 0) {
            console.error('No data found for the selected city:', cityName1);
            return;
        }

        // Extract data for the first city
        let labels = weatherData.map(item => new Date(item.forecast_date).toLocaleDateString());
        let temperatureDataCity1 = weatherData.map(item => item.temperature);
        let humidityDataCity1 = weatherData.map(item => item.humidity);
        let windSpeedDataCity1 = weatherData.map(item => item.wind_speed);

        // Initialize or update the charts with the first city's data
        initOrUpdateChart(tempChart, labels, temperatureDataCity1, cityName1, Utils.CHART_COLORS.red, 0);
        initOrUpdateChart(humidityChart, labels, humidityDataCity1, cityName1, Utils.CHART_COLORS.red, 0);
        initOrUpdateChart(windSpeedChart, labels, windSpeedDataCity1, cityName1, Utils.CHART_COLORS.red, 0);

        if (cityName2) {
            console.log(`Displaying data for ${cityName2}`);
            queryResponse = await fetch(`/weather/queryHistoryByCity?cityName=${encodeURIComponent(cityName2)}`);
            weatherData = await queryResponse.json();
            if (!queryResponse.ok || weatherData.length === 0) {
                console.error('No data found for the selected city:', cityName2);
                return;
            }

            // Extract data for the second city
            let temperatureDataCity2 = weatherData.map(item => item.temperature);
            let humidityDataCity2 = weatherData.map(item => item.humidity);
            let windSpeedDataCity2 = weatherData.map(item => item.wind_speed);

            // Update the charts with the second city's data
            initOrUpdateChart(tempChart, labels, temperatureDataCity2, cityName2, Utils.CHART_COLORS.blue, 1);
            initOrUpdateChart(humidityChart, labels, humidityDataCity2, cityName2, Utils.CHART_COLORS.blue, 1);
            initOrUpdateChart(windSpeedChart, labels, windSpeedDataCity2, cityName2, Utils.CHART_COLORS.blue, 1);
        }

    } catch (error) {
        console.error('Failed to fetch weather data:', error);
    }
}

function initOrUpdateChart(chart, labels, data, label, color, datasetIndex) {
    if (chart.data.datasets[datasetIndex]) {
        chart.data.datasets[datasetIndex].data = data;
        chart.data.datasets[datasetIndex].label = label;
    } else {
        chart.data.datasets.push({
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: Utils.transparentize(color, 0.5)
        });
    }

    chart.data.labels = labels;
    chart.update();
}

