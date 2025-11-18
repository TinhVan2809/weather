/**
 * In-Memory Cache Service with TTL (Time-to-Live)
 * Lưu cache trên server, tự động xóa khi hết hạn
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Lấy giá trị từ cache
   * @param {string} key - Key của cache
   * @returns {any|null} - Giá trị cache hoặc null nếu không tìm thấy/hết hạn
   */
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  /**
   * Lưu giá trị vào cache
   * @param {string} key - Key của cache
   * @param {any} value - Giá trị cần lưu
   * @param {number} ttl - Time-to-Live (milliseconds)
   */
  set(key, value, ttl) {
    // Xóa timer cũ nếu tồn tại
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Lưu giá trị
    this.cache.set(key, value);

    // Tạo timer tự động xóa cache khi hết hạn
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
      console.log(`[Cache] Expired: ${key}`);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Xóa cache theo key
   * @param {string} key - Key của cache
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Xóa tất cả cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Lấy số lượng items trong cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Lấy thông tin cache (debug)
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
