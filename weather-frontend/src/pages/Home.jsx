import { useState, useEffect } from "react";
import { fetchCurrentAndForecast } from "../services/weatherApi";

function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Vietnam"); // State for the search input
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchWeatherData = async (cityName) => {
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
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);  //eslint-disable-line

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

  const getWeatherIcon = (conditionText) => {
    console.log('getWeatherIcon called with:', conditionText);
    const condition = conditionText.toLowerCase();
    console.log('condition after toLowerCase:', condition);
    
    if (condition.includes("rain")) {
      console.log('Matched RAIN');
      return "ri-rainy-line";
    } else if (condition.includes("cloudy") || condition.includes("overcast")) {
      console.log('Matched CLOUDY/OVERCAST');
      return "ri-cloudy-line";
    } else if (condition.includes("snow")) {
      console.log('Matched SNOW');
      return "ri-snowy-line";
    } else if (condition.includes("sunny") || condition.includes("clear")) {
      console.log('Matched SUNNY/CLEAR');
      return "ri-sun-line";
    } else {
      console.log('No match - using default ri-sun-line');
      return "ri-sun-line"; 
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weatherData) return <div>No data</div>;

  const timezone = weatherData?.location?.timezone_id;
  const locationName = weatherData?.location?.name || 'Unknown';
  const locationCountry = weatherData?.location?.country || '';
  const tempC = weatherData?.current?.temp_c || 'N/A';
  // condition là string trực tiếp, không phải object.text
  const conditionText = weatherData?.current?.condition || 'Unknown';

  // Lấy dữ liệu sunrise/sunset động từ API 
  const sunrise = weatherData?.forecast?.[0]?.astro?.sunrise || '';
  const sunset = weatherData?.forecast?.[0]?.astro?.sunset || '';

  
  console.log('Full weatherData structure:', JSON.stringify(weatherData, null, 2));
  console.log('Weather Data:', {
    locationName,
    locationCountry,
    tempC,
    conditionText,
    currentData: weatherData?.current
  });

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
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone })}</span>
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
            <p>Now {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timezone })} <i className="ri-circle-fill"></i> Sunrise {sunrise} <i className="ri-circle-fill"></i> Sunset {sunset} </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;