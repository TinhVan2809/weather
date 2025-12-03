/**
 * Weather Backend Proxy Server
 * Node.js + Express proxy an toàn cho WeatherAPI.com
 * 
 * Features:
 * - Ẩn API key WeatherAPI
 * - In-memory cache với TTL configurable
 * - Rate limiter để tránh abuse
 * - CORS cấu hình chặt
 * - Error handling rõ ràng
 * - WebSocket real-time support
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const weatherRoutes = require('./routes/weatherRoutes');
const { generalLimiter } = require('./middlewares/rateLimit');
const { 
  hideServerInfo, 
  filterSensitiveData, 
  sanitizeQueryLogs,
  noCacheHeaders 
} = require('./middlewares/security');

// ============================================
// Khởi tạo ứng dụng
// ============================================
const app = express();
const server = http.createServer(app);

// ============================================
// Cấu hình môi trường
// ============================================
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

console.log(`
╔════════════════════════════════════════════╗
║   Weather Backend Proxy Server             ║
║   Environment: ${NODE_ENV.padEnd(29)} ║
║   Port: ${PORT.toString().padEnd(36)} ║
║   Frontend Origin: ${FRONTEND_ORIGIN.padEnd(22)} ║
╚════════════════════════════════════════════╝
`);

// ============================================
// Middleware: Body Parser
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Middleware: Security (Ẩn sensitive data)
// ============================================
app.use(hideServerInfo);        // Loại bỏ server info từ headers
app.use(sanitizeQueryLogs);      // Không log query parameters
app.use(filterSensitiveData);    // Filter sensitive data từ responses
app.use(noCacheHeaders);         // Không cache sensitive endpoints

// ============================================
// Middleware: CORS (Cấu hình chặt chẽ)
// ============================================
const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép request từ frontend (hoặc localhost khi testing)
    const allowedOrigins = [
      FRONTEND_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://localhost:3000'
    ];

    // Cho phép request từ server (không có origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[⚠️  CORS] Rejected origin: ${origin}`);
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true, // Cho phép cookies
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ============================================
// Middleware: General Rate Limiter
// ============================================
app.use('/api/', generalLimiter);

// ============================================
// Middleware: Request Logging (Ẩn sensitive data)
// ============================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Chỉ log method + path, không log query parameters (có thể chứa sensitive data)
  const pathOnly = req.path.split('?')[0];
  console.log(`[${timestamp}] ${req.method} ${pathOnly}`);
  
  // Lưu timestamp vào request
  req.startTime = Date.now();
  
  // Ghi lại response time - Ẩn response headers
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`[${timestamp}] ${req.method} ${pathOnly} - ${res.statusCode} (${duration}ms)`);
  });

  // Loại bỏ các headers có thể expose server info
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
});

// ============================================
// Routes: API
// ============================================
app.use('/api', weatherRoutes);

// ============================================
// Route: Health Check
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// Route: Info
// ============================================
app.get('/info', (req, res) => {
  res.status(200).json({
    name: 'Weather Backend Proxy',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      weather: 'GET /api/weather?location=<city>&days=<number>',
      search: 'GET /api/search?q=<query>',
      health: 'GET /health',
      cacheStats: 'GET /api/cache-stats (dev only)',
      cacheClear: 'POST /api/cache-clear (dev only)'
    }
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint không tìm thấy',
    path: req.path,
    method: req.method,
    message: 'Vui lòng kiểm tra lại URL. Xem /info để biết các endpoint khả dụng'
  });
});

// ============================================
// Error Handler (Middleware cuối cùng)
// Không expose sensitive data cho client
// ============================================
app.use((err, req, res, next) => {
  console.error('[❌ Error]', err.message);
  
  // CORS errors
  if (err.message === 'CORS: Origin not allowed') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden'
    });
  }

  // Default error - Không expose chi tiết lỗi trong production
  const statusCode = err.statusCode || 500;
  const isDevelopment = NODE_ENV === 'development';

  // Tạo error message an toàn
  let errorMessage = 'Server error';
  if (statusCode === 400) {
    errorMessage = err.message || 'Bad request';
  } else if (statusCode === 404) {
    errorMessage = 'Not found';
  } else if (statusCode === 429) {
    errorMessage = 'Too many requests';
  } else if (statusCode >= 500) {
    // Không expose chi tiết lỗi server trong production
    errorMessage = isDevelopment ? err.message : 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    // Chỉ show stack trace trong development
    ...(isDevelopment && { 
      stack: err.stack,
      details: err
    })
  });
});

// ============================================
// Cấu hình Socket.IO (Real-time updates)
// ============================================
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log(`[🔌 Socket.IO] Client connected: ${socket.id}`);

  // Event: Subscribe to location weather
  socket.on('subscribe:weather', (location) => {
    console.log(`[🔌 Socket.IO] Client ${socket.id} subscribed to: ${location}`);
    socket.join(`weather:${location}`);
    socket.emit('subscribed', {
      message: `Subscribed to weather updates for ${location}`,
      location: location
    });
  });

  // Event: Unsubscribe from location weather
  socket.on('unsubscribe:weather', (location) => {
    console.log(`[🔌 Socket.IO] Client ${socket.id} unsubscribed from: ${location}`);
    socket.leave(`weather:${location}`);
  });

  socket.on('disconnect', () => {
    console.log(`[🔌 Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Export io để controller có thể sử dụng nếu cần
app.io = io;

// ============================================
// Khởi động server
// ============================================
server.listen(PORT, () => {
  console.log(`
Server đang chạy tại: http://localhost:${PORT}
Kiểm tra health: http://localhost:${PORT}/health
Xem API info: http://localhost:${PORT}/info

CORS Allowed Origins:
${[FRONTEND_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'].map(o => `  ✓ ${o}`).join('\n')}

Cache Config:
  TTL: ${process.env.CACHE_TTL}ms (${process.env.CACHE_TTL / 1000}s)

Rate Limiting:
  General: 100 req/15 min
  Weather: 30 req/1 min
  Search: 20 req/1 min

Press Ctrl+C để dừng server
  `);
});

// ============================================
// Xử lý uncaught exceptions
// ============================================
process.on('uncaughtException', (err) => {
  console.error('[❌ Uncaught Exception]', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[❌ Unhandled Rejection]', reason);
});

module.exports = { app, server, io };