document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    const hourlyCtx = document.getElementById("hourlyChart").getContext("2d");
    const todayWeatherEl = document.getElementById("today-weather");
    const tomorrowWeatherEl = document.getElementById("tomorrow-weather");

    async function fetchWeather(lat, lon) {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,wind_speed_10m_max&hourly=temperature_2m,wind_speed_10m,relative_humidity_2m,weathercode&timezone=auto`
            );
            const data = await response.json();
            displayWeatherInfo(data.daily);
            displayWeatherChart(data.daily);
            displayHourlyChart(data.hourly);
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    }

    function getWeatherIcon(code) {
        const icons = {
            0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
            45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌦️",
            61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "❄️", 73: "❄️", 75: "❄️",
            95: "⛈️", 96: "⛈️", 99: "⛈️"
        };
        return icons[code] || "❓";
    }

    function displayWeatherInfo(weather) {
        // Today's Weather
        todayWeatherEl.innerHTML = `
            <strong>Today:</strong> ${getWeatherIcon(weather.weathercode[0])} 
            <br>🌡️ Max: ${weather.temperature_2m_max[0]}°C / Min: ${weather.temperature_2m_min[0]}°C
            <br>💨 Wind: ${weather.wind_speed_10m_max[0]/3.6} m/s
        `;

        // Tomorrow's Weather
        tomorrowWeatherEl.innerHTML = `
            <strong>Tomorrow:</strong> ${getWeatherIcon(weather.weathercode[1])} 
            <br>🌡️ Max: ${weather.temperature_2m_max[1]}°C / Min: ${weather.temperature_2m_min[1]}°C
            <br>💨 Wind: ${weather.wind_speed_10m_max[1]3.6} m/s
        `;
    }

    function displayWeatherChart(weather) {
        const labels = weather.time.map(date => new Date(date).toLocaleDateString());
        const tempMax = weather.temperature_2m_max;
        const tempMin = weather.temperature_2m_min;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Max Temperature (°C)",
                        data: tempMax,
                        borderColor: "red",
                        backgroundColor: "rgba(255, 0, 0, 0.2)",
                        fill: true,
                    },
                    {
                        label: "Min Temperature (°C)",
                        data: tempMin,
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.2)",
                        fill: true,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }

    function displayHourlyChart(hourly) {
        const hours = hourly.time.slice(0, 12).map(time => new Date(time).getHours() + ":00");
        const temperatures = hourly.temperature_2m.slice(0, 12);
        const windSpeeds = hourly.wind_speed_10m.slice(0, 12);
        const humidity = hourly.relative_humidity_2m.slice(0, 12);

        new Chart(hourlyCtx, {
            type: "bar",
            data: {
                labels: hours,
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: temperatures,
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                    },
                    {
                        label: "Wind Speed (km/h)",
                        data: windSpeeds,
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                    },
                    {
                        label: "Humidity (%)",
                        data: humidity,
                        backgroundColor: "rgba(75, 192, 192, 0.5)",
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Get user's location or use default
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
            () => fetchWeather(60.17, 24.94)
        );
    } else {
        fetchWeather(60.17, 24.94);
    }
});
