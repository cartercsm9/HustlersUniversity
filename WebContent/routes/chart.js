document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/weather/grabOldWeather');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Extract dates and temperatures from data
        const dates = data.map(weather => weather.forecast_date);
        const temperatures = data.map(weather => weather.temperature);

        // Create a new Chart using Chart.js
        const ctx = document.getElementById('weatherChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatures,
                    fill: false,
                    borderColor: 'blue',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching historical weather data:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorMessage);
    }
});
