function submitCityName(inputIdOrCityName, displayId) {

    let cityName;
    console.log(inputIdOrCityName);
    if (document.getElementById(inputIdOrCityName)) {
        // If it's an ID, get the city name from the input's value
        cityName = document.getElementById(inputIdOrCityName).value;
        
    } else {
        // Otherwise, treat it as the city name itself
        cityName = inputIdOrCityName;
    }
    

    fetch('/weather/getWeatherByCity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName: cityName }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayWeatherData(data, displayId);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById(displayId).innerHTML = "Failed to load weather data.";
    });
}


// Function to display weather data in the HTML
function displayWeatherData(data,displayId) {
    const weatherDisplay = document.getElementById(displayId);
    const content = `The current temperature in ${data.location.name} is ${data.current.temp_c}°C and the condition is ${data.current.condition.text}.`;
    weatherDisplay.innerHTML = content;
}
