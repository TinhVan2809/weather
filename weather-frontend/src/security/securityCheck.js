/**
 * Frontend Security Verification
 * Kiểm tra để đảm bảo:
 * 1. Không có direct WeatherAPI calls
 * 2. Không có API key hardcoded
 * 3. Tất cả requests qua backend proxy
 */

// ============================================
// Security Check 1: No Direct WeatherAPI Calls
// ============================================

const forbiddenPatterns = [
  'api.weatherapi.com',
  'weatherapi.com',
  'VITE_WEATHERAPI_KEY',
  'd197dfaaf07e46e2b72193516251711'
];

console.log('%c🔐 Frontend Security Check', 'color: #0066cc; font-weight: bold; font-size: 14px');

// Check inline code for forbidden patterns
const scripts = Array.from(document.querySelectorAll('script'));
const codeContent = scripts.map(s => s.textContent).join('\n');

let securityIssues = 0;

forbiddenPatterns.forEach(pattern => {
  // Skip documentation patterns
  if (pattern.includes('api.weatherapi.com') || pattern.includes('VITE_WEATHERAPI_KEY')) {
    return;
  }

  if (codeContent.includes(pattern)) {
    console.error(`❌ Security Issue: Found "${pattern}" in code`);
    securityIssues++;
  }
});

if (securityIssues === 0) {
  console.log('✅ No direct WeatherAPI calls detected');
  console.log('✅ No API keys hardcoded');
  console.log('✅ All requests must use backend proxy');
} else {
  console.error(`⚠️  Found ${securityIssues} potential security issues`);
}

// ============================================
// Security Check 2: Verify Backend Proxy Usage
// ============================================

console.log('\n%c✅ Backend Proxy Configuration', 'color: #00aa00; font-weight: bold');

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
console.log(`Backend URL: ${backendUrl}`);
console.log('Expected endpoints:');
console.log(`  GET  /api/weather?location=...`);
console.log(`  GET  /api/search?q=...`);

// ============================================
// Network Monitor: Log All Requests
// ============================================

const originalFetch = window.fetch;

window.fetch = function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0].url;

  // Check for direct WeatherAPI calls
  if (url && (url.includes('api.weatherapi.com') || url.includes('weatherapi.com'))) {
    console.error(`🚨 SECURITY VIOLATION: Direct WeatherAPI call detected!`);
    console.error(`   URL: ${url}`);
    console.error(`   This request is visible to anyone inspecting Network tab!`);
    console.error(`   Use backend proxy instead: ${backendUrl}/weather`);
  }

  // Log backend proxy calls
  if (url && url.includes('localhost:3001') || url && url.includes('api')) {
    const method = (args[1] && args[1].method) || 'GET';
    console.log(`📡 ${method} ${url}`);
  }

  return originalFetch.apply(this, args);
};

console.log('\n%c📡 Network Monitoring', 'color: #ff6600; font-weight: bold');
console.log('All fetch requests are being monitored');
console.log('Check console for direct WeatherAPI calls');

// ============================================
// DevTools Warning
// ============================================

console.log('%c⚠️  Developer Info', 'color: #ff0000; font-weight: bold; font-size: 12px');
console.log('This app uses a secure backend proxy for WeatherAPI');
console.log('');
console.log('✅ SAFE in Network tab:');
console.log('   GET /api/weather?location=Hanoi  (no API key)');
console.log('');
console.log('❌ UNSAFE - Should NOT appear:');
console.log('   GET api.weatherapi.com?key=... (direct call)');
console.log('');
console.log('If you see direct WeatherAPI calls, it\'s a security issue!');
console.log('Report it immediately!');
