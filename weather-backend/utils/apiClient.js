/**
 * WeatherAPI.com Proxy Client
 * Wrapper an toàn quanh WeatherAPI, ẩn API key
 * - Không log API key
 * - Không expose request/response details cho DevTools
 * - Filter sensitive data từ responses
 */

const axios = require('axios');
const cacheService = require('./cache');

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';
const API_KEY = process.env.WEATHER_API_KEY;
const CACHE_TTL = parseInt(process.env.CACHE_TTL || 600000); // Default 10 phút

// Kiểm tra API key có được cấu hình
if (!API_KEY) {
  console.error('[❌ ERROR] WEATHER_API_KEY không được cấu hình trong .env');
  process.exit(1);
}

// Axios instance với config mặc định - KHÔNG log sensitive data
const apiClient = axios.create({
  baseURL: WEATHER_API_BASE_URL,
  timeout: 10000, // 10 giây timeout
  headers: {
    // Sử dụng generic user agent để tránh identify backend
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  // Không log request/response interceptors trong development
  withCredentials: false
});

// Interceptor: Ẩn URL thực tế có chứa API key
apiClient.interceptors.request.use(
  (config) => {
    // Không log request URL (chứa API key)
    // Chỉ log tới server console, không stdout
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error.code || error.message);
    return Promise.reject(error);
  }
);

// Interceptor: Filter response trước khi lưu cache
apiClient.interceptors.response.use(
  (response) => {
    // Không log response URL
    return response;
  },
  (error) => {
    if (error.response) {
      // Không log response headers (có thể chứa sensitive data)
      console.error('[API] Response error:', error.response.status);
    }
    return Promise.reject(error);
  }
);

/**
 * Tạo cache key từ endpoint và params
 * Không chứa API key
 */
function generateCacheKey(endpoint, params) {
  const paramStr = Object.entries(params || {})
    .filter(([key]) => key !== 'key') // BỎ TRỌ API key hoàn toàn
    .sort()
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  
  return `${endpoint}:${paramStr}`;
}

/**
 * Lấy dữ liệu thời tiết hiện tại + forecast
 * @param {string} location - Tên địa điểm hoặc tọa độ (format: "city,country" hoặc "lat,lon")
 * @param {number} days - Số ngày forecast (1-10)
 * @returns {Promise<Object>} - Dữ liệu thời tiết
 */
async function getCurrentWeather(location, days = 3) {
  try {
    // Validate input
    if (!location || location.trim() === '') {
      const error = new Error('Location không được để trống');
      error.statusCode = 400;
      throw error;
    }

    const params = {
      key: API_KEY,
      q: location,
      days: Math.min(Math.max(days, 1), 10), // 1-10 days
      aqi: 'yes', // Bật Air Quality Index
      alerts: 'yes' // Bật weather alerts
    };

    // Kiểm tra cache
    const cacheKey = generateCacheKey('current', params);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return {
        ...cachedData,
        fromCache: true
      };
    }

    // Gọi API
    console.log(`[API] Fetching weather for: ${location}`);
    const response = await apiClient.get('/forecast.json', { params });

    const weatherData = {
      location: {
        name: response.data.location.name,
        region: response.data.location.region,
        country: response.data.location.country,
        lat: response.data.location.lat,
        lon: response.data.location.lon,
        timezone_id: response.data.location.tz_id,
        localtime: response.data.location.localtime
      },
      current: {
        temp_c: response.data.current.temp_c,
        temp_f: response.data.current.temp_f,
        condition: response.data.current.condition.text,
        condition_icon: response.data.current.condition.icon,
        humidity: response.data.current.humidity,
        wind_kph: response.data.current.wind_kph,
        wind_mph: response.data.current.wind_mph,
        wind_degree: response.data.current.wind_degree,
        wind_dir: response.data.current.wind_dir,
        pressure_mb: response.data.current.pressure_mb,
        precip_mm: response.data.current.precip_mm,
        visibility_km: response.data.current.visibility_km,
        uv: response.data.current.uv,
        feels_like_c: response.data.current.feelslike_c,
        feels_like_f: response.data.current.feelslike_f,
        aqi: response.data.current.air_quality || null
      },
      forecast: response.data.forecast.forecastday.map(day => ({
        date: day.date,
        max_temp_c: day.day.maxtemp_c,
        max_temp_f: day.day.maxtemp_f,
        min_temp_c: day.day.mintemp_c,
        min_temp_f: day.day.mintemp_f,
        avg_temp_c: day.day.avgtemp_c,
        avg_temp_f: day.day.avgtemp_f,
        condition: day.day.condition.text,
        condition_icon: day.day.condition.icon,
        max_wind_kph: day.day.maxwind_kph,
        total_precip_mm: day.day.totalprecip_mm,
        chance_of_rain: day.day.daily_chance_of_rain,
        chance_of_snow: day.day.daily_chance_of_snow,
        avg_humidity: day.day.avghumidity,
        uv: day.day.uv,
        astro: day.astro,
        hourly: day.hour.map(hour => ({
          time: hour.time,
          temp_c: hour.temp_c,
          condition: hour.condition.text,
          condition_icon: hour.condition.icon,
          humidity: hour.humidity,
          wind_kph: hour.wind_kph,
          precip_mm: hour.precip_mm,
          chance_of_rain: hour.chance_of_rain
        }))
      })),
      alerts: response.data.alerts?.alert || [],
      fromCache: false
    };

    // Lưu vào cache
    cacheService.set(cacheKey, weatherData, CACHE_TTL);
    console.log(`[Cache SAVE] ${cacheKey} (TTL: ${CACHE_TTL}ms)`);

    return weatherData;
  } catch (error) {
    console.error('[API Error] getCurrentWeather:', error.message);
    throw {
      statusCode: error.response?.status || error.statusCode || 500,
      message: error.response?.data?.error?.message || error.message || 'Lỗi khi lấy dữ liệu thời tiết',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }
}

/**
 * Tìm kiếm địa điểm
 * @param {string} query - Tên địa điểm cần tìm
 * @returns {Promise<Array>} - Danh sách địa điểm
 */
async function searchLocation(query) {
  try {
    // Validate input
    if (!query || query.trim().length < 2) {
      const error = new Error('Query phải có ít nhất 2 ký tự');
      error.statusCode = 400;
      throw error;
    }

    const params = {
      key: API_KEY,
      q: query
    };

    // Kiểm tra cache
    const cacheKey = generateCacheKey('search', params);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return {
        results: cachedData,
        fromCache: true
      };
    }

    // Gọi API
    console.log(`[API] Searching location: ${query}`);
    const response = await apiClient.get('/current.json', {
      params: {
        ...params,
        q: query // Sử dụng search.json API
      }
    });

    // WeatherAPI không có endpoint search riêng, dùng current để validate location
    // Nếu bạn muốn dùng endpoint search thực sự, cần nâng cấp plan
    const locations = Array.isArray(response.data) 
      ? response.data 
      : [{
          name: response.data.location.name,
          region: response.data.location.region,
          country: response.data.location.country,
          lat: response.data.location.lat,
          lon: response.data.location.lon,
          timezone_id: response.data.location.tz_id
        }];

    // Cache search results (timeout ngắn hơn - 5 phút)
    cacheService.set(cacheKey, locations, 5 * 60 * 1000);

    return {
      results: locations,
      fromCache: false
    };
  } catch (error) {
    console.error('[API Error] searchLocation:', error.message);
    throw {
      statusCode: error.response?.status || error.statusCode || 500,
      message: error.response?.data?.error?.message || error.message || 'Lỗi khi tìm kiếm địa điểm',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }
}

/**
 * Xóa cache (cho admin/testing)
 */
function clearCache() {
  cacheService.clear();
  console.log('[Cache] Cleared all cache');
}

/**
 * Lấy cache stats (cho monitoring)
 */
function getCacheStats() {
  return cacheService.getStats();
}

module.exports = {
  getCurrentWeather,
  searchLocation,
  clearCache,
  getCacheStats
};
