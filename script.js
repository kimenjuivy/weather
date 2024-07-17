const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeather = document.querySelector(".current-weather");
const forecastContainer = document.querySelector(".forecast-container");

const API_KEY = "8d81860ea06f26b38b73b01ae3cda0bf";

const createWeatherCard = (cityName, weatherItem, index) => {
    const weatherIconClass = getWeatherIconClass(weatherItem.weather[0].description);
    if(index === 0) {
        return `
            <div class="weather-info">
                <h2 class="city-name">${cityName}</h2>
                <p class="date">${weatherItem.dt_txt.split(" ")[0]}</p>
                <div class="temperature">
                    <span class="temp-value">${(weatherItem.main.temp - 273.15).toFixed(1)}</span>
                    <span class="temp-unit">°C</span>
                </div>
                <p class="weather-description">${weatherItem.weather[0].description}</p>
                <i class="weather-icon ${weatherIconClass}"></i> <!-- Dynamic weather icon -->
            </div>
            <div class="weather-details">
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span class="wind-speed">${weatherItem.wind.speed} m/s</span>
                </div>
                <div class="detail">
                    <i class="fas fa-tint"></i>
                    <span class="humidity">${weatherItem.main.humidity}%</span>
                </div>
            </div>`;
    } else {
        return `
            <div class="forecast-item">
                <p class="forecast-date">${weatherItem.dt_txt.split(" ")[0]}</p>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon">
                <p class="forecast-temp">${(weatherItem.main.temp - 273.15).toFixed(1)}°C</p>
                <p class="forecast-description">${weatherItem.weather[0].description}</p>
            </div>`;
    }
}

const getWeatherIconClass = (description) => {
    if (description.includes('rain')) {
        return 'fas fa-cloud-rain';
    } else if (description.includes('clear')) {
        return 'fas fa-sun';
    } else if (description.includes('cloud')) {
        return 'fas fa-cloud';
    } else if (description.includes('snow')) {
        return 'fas fa-snowflake';
    } else if (description.includes('wind')) {
        return 'fas fa-wind';
    } else {
        return 'fas fa-question';
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        cityInput.value = "";
        currentWeather.innerHTML = "";
        forecastContainer.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeather.insertAdjacentHTML("beforeend", html);
            } else {
                forecastContainer.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
