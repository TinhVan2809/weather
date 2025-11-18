import { useState, useEffect, useCallback } from "react";
import { fetchCurrentAndForecast } from "../services/weatherApi";

function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Vietnam"); // State for the search input
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchWeatherData = useCallback(async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentAndForecast(cityName, 3);
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData(city);
  }, [fetchWeatherData, city]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (city) {
      fetchWeatherData(city);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Map conditions to icons for cleaner logic
  const iconMap = {
    rain: "ri-rainy-line",
    cloudy: "ri-cloudy-line",
    overcast: "ri-cloudy-line",
    snow: "ri-snowy-line",
    sunny: "ri-sun-line",
    clear: "ri-sun-line",
  };

  const getWeatherIcon = (conditionText) => {
    const condition = conditionText.toLowerCase();
    // Find the first key in iconMap that is included in the condition string
    const iconKey = Object.keys(iconMap).find(key => condition.includes(key));
    // Return the corresponding icon, or a default one if no match is found
    return iconKey ? iconMap[iconKey] : "ri-sun-line";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weatherData) return <div>No data</div>;


  const locationName = weatherData?.location?.name || 'Unknown';
  const locationCountry = weatherData?.location?.country || '';
  const tempC = weatherData?.current?.temp_c || 'N/A';
  // condition là string trực tiếp, không phải object.text
  const conditionText = weatherData?.current?.condition || 'Unknown';
  
  // Lấy dữ liệu sunrise/sunset động từ API thay vì hardcode
  const sunrise = weatherData?.forecast?.forecastday[0]?.astro?.sunrise || 'N/A';
  const sunset = weatherData?.forecast?.forecastday[0]?.astro?.sunset || 'N/A';

  return (
    <>
      <nav className="nav-container">
        <div className="nav-links">
          <a href="">Home</a>
          <a href="">Dự báo</a>
          <div className="nav-title">
            <p>Weather Forecast</p>
          </div>
          <a href="">Lịch sử</a>
          <a href="">Tiến độ</a>
        </div>
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search for your address..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </nav>

      <section className="today-container">
        <div className="weather-today-container">
          <div className="weather-today">
            <div className="weather-item">
              <i className={getWeatherIcon(conditionText)}></i>
            </div>
            <div className="weather-item">
              <p>Today</p>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="weather-temperatures">
            <div className="temperatures-item">
              <p>{tempC}<i className="ri-celsius-line"></i></p>
            </div>
            <div className="temperatures-item">
              <span>{locationName} - {locationCountry} <i className="ri-map-pin-fill"></i></span>
            </div>
          </div>
          <div className="weather-day">
            <p>Now {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} <i className="ri-circle-fill"></i> Sunrise {sunrise} <i className="ri-circle-fill"></i> Sunset {sunset}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;