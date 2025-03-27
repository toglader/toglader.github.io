document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    const todayWeatherEl = document.getElementById("today-weather");
    const tomorrowWeatherEl = document.getElementById("tomorrow-weather");

    async function fetchWeather(lat, lon) {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
            );
            const data = await response.json();
            displayWeatherInfo(data.daily);
            displayWeatherChart(data.daily);
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    }

    function displayWeatherInfo(weather) {
        const weatherCodes = {
            0: "☀️ Clear Sky",
            1: "🌤️ Mostly Clear",
            2: "⛅ Partly Cloudy",
            3: "☁️ Overcast",
            45: "🌫️ Fog",
            48: "🌫️ Depositing Rime Fog",
            51: "🌦️ Drizzle (Light)",
            53: "🌦️ Drizzle (Moderate)",
            55: "🌦️ Drizzle (Dense)",
            61: "🌧️ Rain (Light)",
            63: "🌧️ Rain (Moderate)",
            65: "🌧️ Rain (Heavy)",
            71: "❄️ Snow (Light)",
            73: "❄️ Snow (Moderate)",
            75: "❄️ Snow (Heavy)",
            95: "⛈️ Thunderstorm",
            96: "⛈️ Thunderstorm (Slight Hail)",
            99: "⛈️ Thunderstorm (Heavy Hail)"
        };

        // Today's Weather
        todayWeatherEl.innerHTML = `
            <strong>Today:</strong> 
            ${weatherCodes[weather.weathercode[0]] || "Unknown"} 
            <br>🌡️ Max: ${weather.temperature_2m_max[0]}°C / Min: ${weather.temperature_2m_min[0]}°C
        `;

        // Tomorrow's Weather
        tomorrowWeatherEl.innerHTML = `
            <strong>Tomorrow:</strong> 
            ${weatherCodes[weather.weathercode[1]] || "Unknown"} 
            <br>🌡️ Max: ${weather.temperature_2m_max[1]}°C / Min: ${weather.temperature_2m_min[1]}°C
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
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Get user's location or use default
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            () => {
                fetchWeather(60.17, 24.94); // Default: Helsinki
            }
        );
    } else {
        fetchWeather(60.17, 24.94);
    }
});
