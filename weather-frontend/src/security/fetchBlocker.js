/**
 * Security: Block Direct WeatherAPI Calls
 * 
 * Kiểm tra để đảm bảo frontend KHÔNG GỌI TRỰC TIẾP WeatherAPI
 * Tất cả requests phải thông qua backend proxy
 */

// List of URLs that should NEVER be called from frontend
const BLOCKED_URLS = [
  'api.weatherapi.com',
  'weatherapi.com',
  'v1/current.json',
  'v1/forecast.json',
  'v1/search.json'
];

// Store original fetch to intercept
const originalFetch = window.fetch;

/**
 * Intercept fetch calls to block direct WeatherAPI requests
 */
window.fetch = function(...args) {
  const url = args[0];
  
  // Check if URL is a direct WeatherAPI call
  for (const blockedUrl of BLOCKED_URLS) {
    if (typeof url === 'string' && url.includes(blockedUrl)) {
      console.error(
        ' SECURITY VIOLATION: Direct WeatherAPI call detected!',
        url
      );
      console.error(' You must use backend proxy instead:');
      console.error('   http://localhost:3001/api/weather?location=...');
      
      // Throw error to prevent request
      throw new Error(
        ` Security: Direct WeatherAPI calls are blocked. ` +
        `Use backend proxy instead: http://localhost:3001/api`
      );
    }
  }
  
  // Allow other requests
  return originalFetch.apply(this, args);
};

console.log(' Security: WeatherAPI direct calls are blocked');
console.log('   Only backend proxy calls allowed');
console.log('   Use: http://localhost:3001/api/weather');
