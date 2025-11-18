/**
 * Rate Limiter Middleware
 * Giới hạn số request từ một IP trong một khoảng thời gian
 */

const rateLimit = require('express-rate-limit');

// Rate limiter cho general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 request per IP per 15 phút
  message: {
    error: 'Quá nhiều request từ IP này, vui lòng thử lại sau',
    retryAfter: 15 * 60 // Thời gian chờ (giây)
  },
  standardHeaders: true, // Trả về info trong `RateLimit-*` headers
  legacyHeaders: false, // Tắt `X-RateLimit-*` headers
  skip: (req) => {
    // Có thể skip rate limit cho localhost hoặc testing
    return process.env.NODE_ENV === 'test';
  }
});

// Rate limiter chặt hơn cho weather endpoints
const weatherLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 30, // Tối đa 30 request per IP per 1 phút
  message: {
    error: 'Quá nhiều request weather API, vui lòng thử lại sau 1 phút',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter rất chặt cho search (vì đây là thao tác tìm kiếm)
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 20, // Tối đa 20 request per IP per 1 phút
  message: {
    error: 'Quá nhiều request search, vui lòng thử lại sau 1 phút',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  weatherLimiter,
  searchLimiter
};
