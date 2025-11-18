#!/usr/bin/env node

/**
 * Security Scanner: Detect Direct WeatherAPI Calls
 * 
 * Usage: node scan-security.js
 * 
 * Kiểm tra toàn bộ src/ để đảm bảo:
 * - Không có direct api.weatherapi.com calls
 * - Không có hardcoded API keys
 * - Tất cả requests phải qua backend proxy
 */

const fs = require('fs');
const path = require('path');

const BLOCKED_PATTERNS = [
  /api\.weatherapi\.com/gi,
  /weatherapi\.com/gi,
  /forecast\.json/gi,
  /current\.json/gi,
  /d197dfaaf07e46e2b72193516251711/gi
];

const SAFE_PATTERNS = [
  /localhost:3001\/api/gi,
  /VITE_BACKEND_URL/gi,
  /backend.*proxy/gi,
];

let issuesFound = 0;
let filesChecked = 0;

/**
 * Scan a single file
 */
function scanFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }

  filesChecked++;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let fileIssues = 0;

  lines.forEach((line, lineNum) => {
    // Skip comments and documentation
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    BLOCKED_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        // Check if it's in a safe context (comment, docs, strings)
        const isSafeContext = SAFE_PATTERNS.some(p => p.test(line));
        if (!isSafeContext) {
          console.error(`❌ SECURITY ISSUE in ${path.relative(process.cwd(), filePath)}:${lineNum + 1}`);
          console.error(`   Pattern: ${pattern.source}`);
          console.error(`   Line: ${line.trim()}`);
          fileIssues++;
          issuesFound++;
        }
      }
    });
  });

  if (fileIssues === 0) {
    console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        scanDirectory(filePath);
      }
    } else {
      scanFile(filePath);
    }
  });
}

/**
 * Main
 */
console.log('🔐 Security Scanner: WeatherAPI Direct Calls');
console.log('=' .repeat(50));

const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
} else {
  console.error('❌ src/ directory not found');
  process.exit(1);
}

console.log('');
console.log('=' .repeat(50));
console.log(`📊 Results:`);
console.log(`   Files checked: ${filesChecked}`);
console.log(`   Issues found: ${issuesFound}`);

if (issuesFound === 0) {
  console.log('\n✅ All clear! No direct WeatherAPI calls detected');
  console.log('✅ Frontend is using backend proxy');
  process.exit(0);
} else {
  console.log(`\n❌ Found ${issuesFound} security issues!`);
  console.log('Please fix these issues immediately!');
  process.exit(1);
}
