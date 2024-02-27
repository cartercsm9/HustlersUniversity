// Function to fetch weather data
function fetchWeatherData(latitude, longitude) {
    const apiKey = "969732e09a6f414692611823240802";
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
    const content = `The current temperature is ${data.current.temp_c}°C and the condition is ${data.current.condition.text}.`;
    weatherDisplay.innerHTML = content;
}

// Function to get the current location of the user
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
        }, (error) => {
            console.error("Error getting location:", error);
            document.getElementById('weatherDisplay').innerHTML = "Geolocation is not supported by this browser or the user denied permission.";
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
        document.getElementById('weatherDisplay').innerHTML = "Geolocation is not supported by this browser.";
    }
}

// Call the function to get the current location and fetch weather data
getCurrentLocation();
