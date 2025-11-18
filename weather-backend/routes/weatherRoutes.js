/**
 * Weather Routes
 * Định tuyến các endpoint liên quan tới thời tiết
 */

const express = require('express');
const router = express.Router();

const weatherController = require('../controllers/weatherController');
const { weatherLimiter, searchLimiter } = require('../middlewares/rateLimit');

/**
 * GET /api/weather?location=<city>&days=<number>
 * Lấy thông tin thời tiết hiện tại + forecast
 * 
 * Query parameters:
 *   - location (required): Tên thành phố, quốc gia hoặc tọa độ (format: "lat,lon")
 *   - days (optional, default: 3): Số ngày forecast (1-10)
 * 
 * Example: /api/weather?location=Hanoi&days=5
 * Example: /api/weather?location=21.0285,105.8542&days=3
 */
router.get('/weather', weatherLimiter, weatherController.getWeather);

/**
 * GET /api/search?q=<query>
 * Tìm kiếm địa điểm
 * 
 * Query parameters:
 *   - q (required): Tên địa điểm cần tìm (ít nhất 2 ký tự)
 * 
 * Example: /api/search?q=Ha%20Noi
 */
router.get('/search', searchLimiter, weatherController.searchLocation);

/**
 * GET /api/cache-stats
 * Lấy thông tin cache (development only)
 */
router.get('/cache-stats', weatherController.getCacheStats);

/**
 * POST /api/cache-clear
 * Xóa cache (development only)
 */
router.post('/cache-clear', weatherController.clearCache);

module.exports = router;
