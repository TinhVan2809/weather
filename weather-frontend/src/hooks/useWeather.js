/**
 * useWeather Hook
 * Custom hook để manage weather data và loading states
 */

import { useState, useCallback } from 'react';
import {
  fetchCurrentAndForecast,
  searchLocations,
  checkBackendHealth
} from '../services/weatherApi';

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(false);

  /**
   * Lấy thông tin thời tiết
   */
  const getWeather = useCallback(async (location, days = 3) => {
    if (!location) {
      setError('Địa điểm không được để trống');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCurrentAndForecast(location, days);
      setWeather(data);
      setLastLocation(location);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Lỗi khi lấy dữ liệu thời tiết';
      setError(errorMessage);
      console.error('Error fetching weather:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tìm kiếm địa điểm
   */
  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 2) {
      throw new Error('Query phải có ít nhất 2 ký tự');
    }

    try {
      const result = await searchLocations(query);
      return result.results;
    } catch (err) {
      console.error('Error searching location:', err);
      throw err;
    }
  }, []);

  /**
   * Kiểm tra backend health
   */
  const checkHealth = useCallback(async () => {
    try {
      const healthy = await checkBackendHealth();
      setBackendHealthy(healthy);
      return healthy;
    } catch (err) {
      console.error('Error checking backend health:', err);
      setBackendHealthy(false);
      return false;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setWeather(null);
    setError(null);
    setLastLocation(null);
  }, []);

  return {
    // State
    weather,
    loading,
    error,
    lastLocation,
    backendHealthy,

    // Methods
    getWeather,
    searchLocation,
    checkHealth,
    reset
  };
}

export default useWeather;
