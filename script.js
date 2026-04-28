// script.js — Weather App (OpenWeatherMap)
const API_KEY = 'b539d2433398450363bc313feb19575d'; 

// DOM elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const errorEl = document.getElementById("error");
const loadingEl = document.getElementById("loading");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl = document.getElementById("cityName");
const dateTextEl = document.getElementById("dateText");
const weatherIconEl = document.getElementById("weatherIcon");
const conditionEl = document.getElementById("condition");
const tempValueEl = document.getElementById("tempValue");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const feelsEl = document.getElementById("feels");

// helpers
function showError(message) {
  errorEl.textContent = message;
  weatherCard.classList.add("hidden");
}

function clearError() {
  errorEl.textContent = "";
}

function setLoading(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
  // also disable form while loading
  cityInput.disabled = isLoading;
}

// format date
function formatDate(dt) {
  const d = new Date(dt * 1000); // dt from API is unix seconds
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// background by weather main
function applyBackground(main) {
  // remove existing bg classes
  document.body.classList.remove("bg-clear","bg-clouds","bg-rain","bg-snow","bg-mist");
  switch ((main || "").toLowerCase()) {
    case "clear": document.body.classList.add("bg-clear"); break;
    case "clouds": document.body.classList.add("bg-clouds"); break;
    case "rain":
    case "drizzle": document.body.classList.add("bg-rain"); break;
    case "snow": document.body.classList.add("bg-snow"); break;
    case "mist":
    case "haze":
    case "fog": document.body.classList.add("bg-mist"); break;
    default: /* keep default gradient */ break;
  }
}

// main fetch function
async function fetchWeather(city) {
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  clearError();
  setLoading(true);

  try {
    // Build URL (metric units)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("City not found. Check spelling and try again.");
      } else {
        throw new Error("Unable to fetch weather. Try again later.");
      }
    }

    const data = await res.json();
    // data structure: data.weather[0], data.main.temp, data.wind.speed, data.name, data.sys.country

    // populate UI
    const weather = data.weather && data.weather[0];
    const main = data.main || {};
    const wind = data.wind || {};

    cityNameEl.textContent = `${data.name}, ${data.sys?.country || ""}`;
    dateTextEl.textContent = formatDate(data.dt);
    conditionEl.textContent = weather?.main || weather?.description || "N/A";
    tempValueEl.textContent = Math.round(main.temp);
    humidityEl.textContent = `${main.humidity ?? "--"} %`;
    windEl.textContent = `${wind.speed ?? "--"} m/s`;
    feelsEl.textContent = `${Math.round(main.feels_like ?? main.temp ?? 0)} °C`;

    // icon
    if (weather?.icon) {
      weatherIconEl.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
      weatherIconEl.alt = weather.description || weather.main;
    } else {
      weatherIconEl.src = "";
      weatherIconEl.alt = "weather icon";
    }

    // background
    applyBackground(weather?.main);

    // show card
    weatherCard.classList.remove("hidden");
  } catch (err) {
    showError(err.message || "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
}

// handle submit
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  fetchWeather(city);
});

