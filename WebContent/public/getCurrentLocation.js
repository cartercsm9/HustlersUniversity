function requestUserLocation() {
    const userAgreed = window.confirm("We need your location to provide local weather information. Do you allow us to access your location?");
    if (userAgreed) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getCityName(latitude, longitude, (cityName) => {
                    console.log("Callback with cityName:", cityName);
                    submitCityName(cityName, 'currentWeather');
                });
            }, function(error) {
                console.error("Error occurred: " + error.message);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            console.log("Geolocation is not supported by your browser.");
        }
    } else {
        console.log("User did not allow location access.");
    }
}

function getCityName(latitude, longitude, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.address && data.address.city) {
                console.log("City: " + data.address.city);
                callback(data.address.city); // Use callback to return city name
            } else if (data.address && (data.address.town || data.address.village)) {
                console.log("Location: " + (data.address.town || data.address.village));
                callback(data.address.town || data.address.village); // Use callback to return town or village name
            } else {
                console.log("City name not found in the data");
            }
        })
        .catch(error => {
            console.error("Error fetching city name: ", error);
        });
}

