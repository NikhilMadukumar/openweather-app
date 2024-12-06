import { FaReact } from "react-icons/fa";
import TopButtons from "./components/TopButtons";
import Inputs from "./components/Inputs";
import TimeAndLocation from "./components/TimeAndLocation";
import TempAndDetails from "./components/TempAndDetails";
import Forecast from "./components/Forecast";
import getFormattedWeatherData from "./services/weatherService";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const App = () => {
  const [query, setQuery] = useState({ q: "Mumbai" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null); // State to store errors

  const getWeather = async () => {
    const cityName = query.q ? query.q : "current location";
    toast.info(`Fetching weather data for ${capitalizeFirstLetter(cityName)}`);
    try {
      const data = await getFormattedWeatherData({ ...query, units });
      if (!data) {
        throw new Error("No data returned from the weather service.");
      }
      setWeather(data);
      setError(null); // Clear any previous error
      toast.success(`Fetched weather data for ${data.name}, ${data.country}`);
      console.log(data); // Log fetched weather data
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
      setError("City not found or invalid. Please check the spelling and try again."); // Set error state
      toast.error("City not found or invalid. Please check the spelling and try again."); // Display error notification
    }
  };

  useEffect(() => {
    getWeather();
  }, [query, units]);

  const formatBackground = () => {
    if (!weather) return "from-cyan-600 to-blue-700";
    const threshold = units === "metric" ? 20 : 68;
    return weather.temp <= threshold ? "from-cyan-400 to-blue-900" : "from-yellow-600 to-orange-800";
  };

  return (
    <div
      className="min-h-screen py-5 bg-[url('https://wallpapercave.com/wp/wp8624226.jpg')] bg-no-repeat bg-cover"
    >
      <div
        className={`mx-auto max-w-screen-lg mt-4 py-5 px-32 bg-gradient-to-br rounded-lg shadow-xl shadow-gray-400 ${formatBackground()}`}
      >
        <TopButtons setQuery={setQuery} />
        <Inputs setQuery={setQuery} setUnits={setUnits} />

        {/* Display weather data only if available */}
        {weather && (
          <>
            <TimeAndLocation weather={weather} />
            <TempAndDetails weather={weather} units={units} />
            <Forecast title="3 hour step forecast" data={weather.hourly} />
            <Forecast title="daily forecast" data={weather.daily} />
          </>
        )}

        {/* Display an error notification if there is an error */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <ToastContainer autoClose={2500} hideProgressBar={true} theme="colored" />
      </div>
    </div>
  );
};

export default App;
