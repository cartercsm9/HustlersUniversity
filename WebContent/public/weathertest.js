// Function to fetch weather data
function fetchWeatherData(latitude, longitude) {
    const apiKey = "969732e09a6f414692611823240802"; // Use your actual API key
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Instead of logging, display the weather data in the HTML
            displayWeatherData(data);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            document.getElementById('weatherDisplay').innerHTML = "Failed to load weather data.";
        });
}

// Function to display weather data in the HTML
function displayWeatherData(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    const content = `The current temperature in ${data.location.name} is ${data.current.temp_c}°C and the condition is ${data.current.condition.text}.`;
    weatherDisplay.innerHTML = content;
}

function submitCityName() {
    const cityName = document.getElementById('cityName').value;
    getCoordinatesForCity(cityName);
}

function getCoordinatesForCity(cityName) {
    const secKey = "8652a085d67ff8dea711c4a411ec5928"
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${secKey}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                fetchWeatherData(lat, lon);
            } else {
                throw new Error("City not found");
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            document.getElementById('weatherDisplay').innerHTML = "Failed to load coordinates for city.";
        });
}


// Remove the duplicate getCurrentLocation call to streamline user experience
