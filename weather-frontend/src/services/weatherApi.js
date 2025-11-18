/**
 * Weather API Service
 * Frontend proxy service - gọi backend proxy thay vì gọi trực tiếp WeatherAPI
 * 
 * SECURITY:
 * - API key WeatherAPI không được expose cho frontend
 * - Dữ liệu được cache server-side
 * - Rate limit được kiểm soát server-side
 * - Không log sensitive data
 */

// Backend proxy URL
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

/**
 * Fetch current + forecast từ backend proxy
 * @param {string} location - city name hoặc "lat,lon"
 * @param {number} days - số ngày forecast (default: 3)
 * @returns {Promise<{location:..., current:..., forecast:...}>}
 */
export async function fetchCurrentAndForecast(location, days = 3) {
  if (!location) throw new Error('Missing location');
  
  try {
    const url = `${BACKEND_BASE_URL}/weather?location=${encodeURIComponent(location)}&days=${days}`;
    
    // Không log URL - để tránh expose internal API paths
    if (import.meta.env.DEV) {
      console.log(`[Weather] Fetching data for: ${location}`);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const message = data.error || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return {
      ...data.data,
      fromCache: data.fromCache,
      apiTimestamp: data.timestamp
    };
  } catch (error) {
    // Không log error details - chỉ console error message
    console.error('Error fetching weather:', error.message);
    throw error;
  }
}

/**
 * Search location từ backend proxy
 * @param {string} query - tên địa điểm cần tìm
 * @returns {Promise<Array>} - danh sách địa điểm
 */
export async function searchLocations(query) {
  if (!query || query.length < 2) {
    throw new Error('Query phải có ít nhất 2 ký tự');
  }

  try {
    const url = `${BACKEND_BASE_URL}/search?q=${encodeURIComponent(query)}`;
    
    // Không log URL
    if (import.meta.env.DEV) {
      console.log(`[Search] Searching for: ${query}`);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const message = data.error || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return {
      results: data.results,
      fromCache: data.fromCache,
      count: data.count
    };
  } catch (error) {
    console.error('Error searching locations:', error.message);
    throw error;
  }
}

/**
 * Get cache stats (development only)
 * @returns {Promise<Object>} - cache statistics
 */
export async function getCacheStats() {
  try {
    const url = `${BACKEND_BASE_URL}/cache-stats`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    return data.cache;
  } catch (error) {
    console.error('Error getting cache stats:', error.message);
    throw error;
  }
}

/**
 * Clear backend cache (development only)
 * @returns {Promise<Object>}
 */
export async function clearBackendCache() {
  try {
    const url = `${BACKEND_BASE_URL}/cache-clear`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    throw error;
  }
}

/**
 * Health check backend server
 * @returns {Promise<Boolean>} - true nếu backend online
 */
export async function checkBackendHealth() {
  try {
    const baseUrl = BACKEND_BASE_URL.replace('/api', '');
    const res = await fetch(`${baseUrl}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
