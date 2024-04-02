function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 2
    });

    const input = document.getElementById('search-box');
    const searchBox = new google.maps.places.SearchBox(input);

    map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    // Encapsulate fetch logic into its own function
    function fetchWeatherData(latitude, longitude) {
        fetch('/weather/getWeatherByCoor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude, longitude }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeatherDataId(data, "pointerWeather");
            const cityName = data.location.name;
            return fetch('/weather/insertForecast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cityName }),
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("pointerWeather").innerHTML = "Failed to load weather data.";
        });
    }

    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        markers.forEach(marker => marker.setMap(null));
        markers = [];

        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            const clickMarker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: "Selected Location"
            });
            markers.push(clickMarker);

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            // Fetch weather data for the searched place
            fetchWeatherData(place.geometry.location.lat(), place.geometry.location.lng());
        });
        map.fitBounds(bounds);
    });

    // Add click listener to the map to add a marker where the user clicks
    map.addListener('click', (e) => {
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        // Create a new marker where the map is clicked
        const clickMarker = new google.maps.Marker({
            position: e.latLng,
            map: map,
            title: "Selected Location"
        });
        markers.push(clickMarker);

        // Fetch weather data for the clicked location
        fetchWeatherData(e.latLng.lat(), e.latLng.lng());
    });
}

window.initMap = initMap;
