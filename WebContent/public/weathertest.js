function submitCityName() {
    const cityName = document.getElementById('cityName').value;
    fetch('/getWeatherByCity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Correctly format the cityName as JSON
        body: JSON.stringify({ cityName: cityName }),
    })
    .then(response => {
        if (!response.ok) {
            // Handle non-OK responses from the server
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Assuming the server always responds with JSON
    })
    .then(data => {
        displayWeatherData(data);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('weatherDisplay').innerHTML = "Failed to load weather data.";
    });
}


// Function to display weather data in the HTML
function displayWeatherData(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    const content = `The current temperature in ${data.location.name} is ${data.current.temp_c}°C and the condition is ${data.current.condition.text}.`;
    weatherDisplay.innerHTML = content;
}
