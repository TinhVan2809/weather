/**
 * Security Middleware
 * Ẩn sensitive data từ DevTools và browser inspection
 */

/**
 * Middleware: Ẩn server info từ headers
 * Loại bỏ các headers có thể reveal server technology stack
 */
function hideServerInfo(req, res, next) {
  // Loại bỏ headers tiết lộ server info
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Thêm security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
}

/**
 * Middleware: Filter sensitive data từ responses
 * Đảm bảo không có API key hoặc credentials trong responses
 */
function filterSensitiveData(req, res, next) {
  const originalJson = res.json;

  res.json = function(data) {
    // Nếu là error response, không show chi tiết nhạy cạm
    if (data && !data.success && process.env.NODE_ENV !== 'development') {
      // Chỉ giữ error message, loại bỏ stack trace
      const filtered = {
        success: data.success,
        error: data.error
      };
      return originalJson.call(this, filtered);
    }

    // Nếu là weather data response, ẩn certain fields
    if (data && data.data) {
      // Không cần ẩn gì từ weather data, vì đã được filter ở apiClient
      return originalJson.call(this, data);
    }

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Middleware: Loại bỏ query parameters từ logs
 * Để tránh log API keys hoặc sensitive data
 */
function sanitizeQueryLogs(req, res, next) {
  // Override req.url để không log full query string
  const originalUrl = req.url;
  req.url = req.path; // Chỉ giữ path, loại bỏ query string

  // Restore sau khi middleware chain xong
  res.on('finish', () => {
    req.url = originalUrl;
  });

  next();
}

/**
 * Middleware: Prevent cache của sensitive endpoints
 */
function noCacheHeaders(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

module.exports = {
  hideServerInfo,
  filterSensitiveData,
  sanitizeQueryLogs,
  noCacheHeaders
};
