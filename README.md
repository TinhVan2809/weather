![](https://github.com/TinhVan2809/weather/blob/4109ffd4307ea61a4bcca13a1426b695f9f5194b/weather-frontend/public/Screenshot2025-11-19-011336.png)

# Weather Forecast

Backend proxy Node.js + Express an toàn để ẩn API key của WeatherAPI.com

## Tính Năng

**Ẩn API Key**: API key WeatherAPI không bao giờ được expose cho frontend
**In-Memory Cache**: Lưu trữ dữ liệu thời tiết với TTL có thể cấu hình
**Rate Limiter**: Chống abuse với giới hạn request khác nhau
**CORS Chặt Chẽ**: Chỉ cho phép origin của frontend được phép
**Error Handling**: Xử lý lỗi rõ ràng và chi tiết
**Real-Time Support**: WebSocket với Socket.IO
**Logging**: Request logging với thời gian xử lý

## Yêu Cầu Hệ Thống

- Node.js >= 14.0
- npm >= 6.0

## Cài Đặt và Cách Lấy API

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
# Copy file .env.example
cp .env.example .env
```

Sau đó chỉnh sửa `.env`:

```env
NODE_ENV=development
WEATHER_API_KEY=your_actual_api_key_here
FRONTEND_ORIGIN=http://localhost:5173
PORT=3001
CACHE_TTL=600000
```

**Lấy WeatherAPI key:**
- Truy cập: https://www.weatherapi.com/
- Đăng ký tài khoản miễn phí
- Copy API key vào `.env`

### 3. Khởi động server

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3001`

## 📡 API Endpoints

### 1. Lấy thông tin thời tiết hiện tại + Forecast

```
GET /api/weather?location=<city>&days=<number>
```

**Query Parameters:**
- `location` (bắt buộc): Tên thành phố, quốc gia hoặc tọa độ
  - Format: `"Hanoi"`, `"Da Nang, Vietnam"`, `"21.0285,105.8542"`
- `days` (tùy chọn): Số ngày forecast (1-10), mặc định: 3

**Example:**

```bash
curl "http://localhost:3001/api/weather?location=Hanoi&days=5"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "location": {
      "name": "Hanoi",
      "region": "Hanoi",
      "country": "Vietnam",
      "lat": 21.0285,
      "lon": 105.8542,
      "timezone_id": "Asia/Ho_Chi_Minh",
      "localtime": "2024-01-15 14:30"
    },
    "current": {
      "temp_c": 25.5,
      "temp_f": 77.9,
      "condition": "Partly cloudy",
      "condition_icon": "https://...",
      "humidity": 65,
      "wind_kph": 12,
      "wind_mph": 7.5,
      "wind_degree": 180,
      "wind_dir": "S",
      "pressure_mb": 1013,
      "precip_mm": 0,
      "visibility_km": 10,
      "uv": 5.2,
      "feels_like_c": 26.1,
      "feels_like_f": 79
    },
    "forecast": [
      {
        "date": "2024-01-15",
        "max_temp_c": 28,
        "min_temp_c": 22,
        "condition": "Partly cloudy",
        "condition_icon": "https://...",
        "astro": {
                    "sunrise": "06:09 AM",
                    "sunset": "05:15 PM",
                    "moonrise": "04:17 AM",
                    "moonset": "03:46 PM",
                    "moon_phase": "Waning Crescent",
                    "moon_illumination": 5,
                    "is_moon_up": 0,
                    "is_sun_up": 0
                },
        "hourly": [...]
      }
    ],
    "alerts": [],
    "fromCache": false
  },
  "fromCache": false,
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

### 2. Tìm kiếm địa điểm

```
GET /api/search?q=<query>
```

**Query Parameters:**
- `q` (bắt buộc): Tên địa điểm cần tìm (ít nhất 2 ký tự)

**Example:**

```bash
curl "http://localhost:3001/api/search?q=Ha%20Noi"
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "name": "Hanoi",
      "region": "Hanoi",
      "country": "Vietnam",
      "lat": 21.0285,
      "lon": 105.8542,
      "timezone_id": "Asia/Ho_Chi_Minh"
    }
  ],
  "count": 1,
  "fromCache": false,
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

### 3. Health Check

```
GET /health
```

Kiểm tra server còn hoạt động không.

```bash
curl "http://localhost:3001/health"
```

### 4. API Info

```
GET /info
```

Xem thông tin API và các endpoint khả dụng.

```bash
curl "http://localhost:3001/info"
```

### 5. Cache Stats (Development Only)

```
GET /api/cache-stats
```

Xem thông tin cache (số lượng items, keys, etc.)

### 6. Xóa Cache (Development Only)

```
POST /api/cache-clear
```

Xóa tất cả cache để testing

## Cấu Hình

### Cache TTL

Sửa `CACHE_TTL` trong `.env` (tính bằng milliseconds):

```env
# Cache 10 phút (600000ms)
CACHE_TTL=600000

# Cache 5 phút (300000ms)
CACHE_TTL=300000

# Cache 1 phút (60000ms)
CACHE_TTL=60000
```

### Rate Limiter

Sửa trong `middlewares/rateLimit.js`:

```javascript
// Weather endpoints: 30 requests per 1 minute
const weatherLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30
});

// Search endpoints: 20 requests per 1 minute
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20
});
```

### CORS

Sửa trong `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',      // Vite dev server
  'http://localhost:3000',      // React dev server
  'https://yourdomain.com'      // Production domain
];
```

## Bảo Mật

### API Key Không Bao Giờ Được Expose

API key chỉ được lưu server-side (trong `.env`)
Frontend chỉ gọi các endpoint proxy (`/api/weather`, `/api/search`)
Server sẽ gửi request tới WeatherAPI với API key
Response được filter và trả về cho frontend

### CORS Chặt Chẽ

Chỉ cho phép origin trong danh sách `allowedOrigins`
Ngăn chặn các request từ domain lạ

### Rate Limiting

General limit: 100 requests per 15 minutes
Weather endpoints: 30 requests per 1 minute
Search endpoints: 20 requests per 1 minute

#Cấu Trúc Thư Mục

```
weather-backend/
├── server.js                 # Server chính
├── package.json
├── .env                      # Biến môi trường (local)
├── .env.example              # Template biến môi trường
├── controllers/
│   └── weatherController.js  # Business logic
├── routes/
│   └── weatherRoutes.js      # Route definitions
├── middlewares/
│   └── rateLimit.js          # Rate limiting
└── utils/
    ├── apiClient.js          # WeatherAPI wrapper
    └── cache.js              # In-memory cache
```

## Testing

### Sử dụng cURL

```bash
# Test weather API
curl "http://localhost:3001/api/weather?location=Hanoi&days=3"

# Test search
curl "http://localhost:3001/api/search?q=Da%20Nang"

# Test health
curl "http://localhost:3001/health"

# Test cache stats (dev only)
curl "http://localhost:3001/api/cache-stats"

# Clear cache (dev only)
curl -X POST "http://localhost:3001/api/cache-clear"
```

### Sử dụng Frontend

Gọi API từ frontend:

```javascript
// src/services/weatherApi.js
const API_BASE_URL = 'http://localhost:3001/api';

export async function getWeather(location, days = 3) {
  const response = await fetch(
    `${API_BASE_URL}/weather?location=${location}&days=${days}`
  );
  return response.json();
}

export async function searchLocation(query) {
  const response = await fetch(
    `${API_BASE_URL}/search?q=${query}`
  );
  return response.json();
}
```

## Troubleshooting

### Error: WEATHER_API_KEY không được cấu hình

**Giải pháp:**
1. Tạo file `.env` từ `.env.example`
2. Thêm WEATHER_API_KEY vào `.env`
3. Restart server

### Error: CORS: Origin not allowed

**Giải pháp:**
1. Kiểm tra FRONTEND_ORIGIN trong `.env`
2. Thêm origin vào `allowedOrigins` trong `server.js`
3. Restart server

### Error: Quá nhiều request

**Giải pháp:**
- Chờ khoảng 1-15 phút tùy theo rate limiter
- Hoặc xóa cache và restart: `POST /api/cache-clear`

### Cache không hoạt động

**Kiểm tra:**
```bash
curl "http://localhost:3001/api/cache-stats"
```

**Reset cache:**
```bash
curl -X POST "http://localhost:3001/api/cache-clear"
```

## Logging

Server sẽ in ra console:

```
[2024-01-15T14:30:00.000Z] GET /api/weather?location=Hanoi&days=3
[2024-01-15T14:30:00.150Z] GET /api/weather?location=Hanoi&days=3 - 200 (150ms)
[Cache HIT] current:days=3&location=Hanoi
[API] Fetching weather for: Hanoi
[Cache SAVE] current:days=3&location=Hanoi (TTL: 600000ms)
```

Backend hỗ trợ real-time updates thông qua Socket.IO:

```javascript
// Frontend
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Subscribe to weather updates
socket.emit('subscribe:weather', 'Hanoi');

socket.on('subscribed', (data) => {
  console.log('Subscribed to:', data.location);
});

// Unsubscribe
socket.emit('unsubscribe:weather', 'Hanoi');
```

```icon/font
icon - Remix-Icon
font - "Inter" Google font 
image - pexels - google
```


**Happy Weather Coding! 🌤️**

