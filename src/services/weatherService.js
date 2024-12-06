import { DateTime } from "luxon";

const API_KEY = "4a69cedc31877b9e7808699b1251a50d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

const getWeatherData = (infoType, searchParams) => {
    const url = new URL(BASE_URL + infoType);
    url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

    return fetch(url).then((res) => res.json());
};

const iconUrlFromCode = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`;

const formatToLocalTime = (secs, offset, format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a") =>
    DateTime.fromSeconds(secs + offset, { zone: "utc" }).toFormat(format);

const formatCurrentWeather = (data) => {
    const {
        coord: { lat, lon },
        main: { temp, feels_like, temp_min, temp_max, humidity },
        name,
        dt,
        sys: { country, sunrise, sunset },
        weather,
        wind: { speed },
        timezone,
    } = data;

    const { main: details, icon } = weather[0];
    const formattedLocalTime = formatToLocalTime(dt, timezone);
    return {
        temp,
        feels_like,
        temp_min,
        temp_max,
        humidity,
        name,
        country,
        sunrise: formatToLocalTime(sunrise, timezone, "hh:mm a"),
        sunset: formatToLocalTime(sunset, timezone, "hh:mm a"),
        speed,
        details,
        icon: iconUrlFromCode(icon),
        dt,
        timezone,
        formattedLocalTime,
        lat,
        lon,
    };
};

const formatForecastWeather = (data, offset) => {
    const hourly = data.slice(0, 5).map((f) => ({
        temp: f.main.temp,
        time: formatToLocalTime(f.dt, offset, "hh:mm a"),
        icon: iconUrlFromCode(f.weather[0].icon),
    }));

    const daily = data
        .filter((f) => f.dt_txt.includes("12:00:00")) // Adjust for midday forecasts
        .map((f) => ({
            temp: f.main.temp,
            day: formatToLocalTime(f.dt, offset, "cccc"),
            icon: iconUrlFromCode(f.weather[0].icon),
        }));

    return { hourly, daily };
};

const getFormattedWeatherData = async (searchParams) => {
    // Fetch current weather data
    const formattedCurrentWeather = await getWeatherData("weather", searchParams).then(formatCurrentWeather);

    const { lat, lon, timezone } = formattedCurrentWeather;

    // Fetch forecast weather data
    const formattedForecastWeather = await getWeatherData("forecast", {
        lat,
        lon,
        units: searchParams.units,
    }).then((d) => formatForecastWeather(d.list, timezone));

    return { ...formattedCurrentWeather, ...formattedForecastWeather };
};

export default getFormattedWeatherData;
