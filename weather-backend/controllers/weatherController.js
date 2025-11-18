/**
 * Weather Controller
 * Xử lý các request liên quan tới thời tiết
 */

const apiClient = require('../utils/apiClient');

/**
 * GET /api/weather
 * Lấy thông tin thời tiết hiện tại + forecast
 */
async function getWeather(req, res) {
  try {
    const { location, days = 3 } = req.query;

    // Validate location
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location là bắt buộc',
        message: 'Vui lòng cung cấp tham số query: ?location=<city>'
      });
    }

    // Gọi API client
    const weatherData = await apiClient.getCurrentWeather(location, parseInt(days));

    // Kiểm tra xem sunrise/sunset có trong dữ liệu không
    if (!weatherData.forecast?.[0]?.astro?.sunrise || !weatherData.forecast?.[0]?.astro?.sunset) {
      console.warn(`[Controller] Cảnh báo: Dữ liệu sunrise/sunset không có sẵn cho địa điểm "${location}".`);
    }

    // Return response
    res.status(200).json({
      success: true,
      data: weatherData,
      fromCache: weatherData.fromCache,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Controller Error] getWeather:', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Lỗi khi lấy dữ liệu thời tiết';

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { debug: error.error })
    });
  }
}

/**
 * GET /api/search
 * Tìm kiếm địa điểm
 */
async function searchLocation(req, res) {
  try {
    const { q } = req.query;

    // Validate query
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query không hợp lệ',
        message: 'Vui lòng cung cấp tham số: ?q=<location> (ít nhất 2 ký tự)'
      });
    }

    // Gọi API client
    const result = await apiClient.searchLocation(q);

    // Return response
    res.status(200).json({
      success: true,
      results: result.results,
      fromCache: result.fromCache,
      count: result.results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Controller Error] searchLocation:', error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Lỗi khi tìm kiếm địa điểm';

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { debug: error.error })
    });
  }
}

/**
 * GET /api/cache-stats
 * Lấy thông tin cache (development only)
 */
function getCacheStats(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Không có quyền truy cập'
    });
  }

  try {
    const stats = apiClient.getCacheStats();
    res.status(200).json({
      success: true,
      cache: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy cache stats'
    });
  }
}

/**
 * POST /api/cache-clear
 * Xóa cache (development only)
 */
function clearCache(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Không có quyền truy cập'
    });
  }

  try {
    apiClient.clearCache();
    res.status(200).json({
      success: true,
      message: 'Cache đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa cache'
    });
  }
}

module.exports = {
  getWeather,
  searchLocation,
  getCacheStats,
  clearCache
};
