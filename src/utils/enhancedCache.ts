/**
 * 增强缓存系统
 * 支持分层缓存（L1内存 + L2 localStorage）和LRU淘汰策略
 */

interface CacheItem<T> {
  data: T;
  expiresAt: number;
  lastAccess: number;  // 最后访问时间，用于LRU
  accessCount: number; // 访问次数，用于统计
}

interface CacheStats {
  hits: number;        // 缓存命中次数
  misses: number;      // 缓存未命中次数
  size: number;        // 当前缓存项数量
  memorySize: number;  // 内存缓存大小
  storageSize: number; // 存储缓存大小
}

// L1缓存：内存缓存（Map）
class MemoryCache {
  private cache: Map<string, CacheItem<any>>;
  private maxSize: number;
  private stats: CacheStats;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memorySize: 0,
      storageSize: 0
    };
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.size--;
      this.stats.misses++;
      return null;
    }

    // 更新访问信息
    item.lastAccess = Date.now();
    item.accessCount++;
    this.stats.hits++;
    return item.data as T;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // 如果超过最大大小，使用LRU淘汰
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      data,
      expiresAt: Date.now() + ttl,
      lastAccess: Date.now(),
      accessCount: 1
    };

    if (!this.cache.has(key)) {
      this.stats.size++;
    }
    this.cache.set(key, item);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    if (this.cache.delete(key)) {
      this.stats.size--;
    }
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  // LRU淘汰：删除最久未访问的项
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.size--;
    }
  }

  // 清理过期项
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.stats.size -= cleaned;
    return cleaned;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getSize(): number {
    return this.cache.size;
  }
}

// L2缓存：localStorage缓存
class StorageCache {
  private prefix: string;
  private stats: CacheStats;

  constructor(prefix: string = 'cache:') {
    this.prefix = prefix;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memorySize: 0,
      storageSize: 0
    };
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    // 如果没有前缀，直接使用key；如果有前缀，添加前缀
    const storageKey = this.prefix ? `${this.prefix}${key}` : key;
    const itemStr = localStorage.getItem(storageKey);
    
    if (!itemStr) {
      this.stats.misses++;
      return null;
    }

    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // 检查是否过期
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(storageKey);
        this.stats.misses++;
        return null;
      }

      // 更新访问信息
      item.lastAccess = Date.now();
      item.accessCount++;
      localStorage.setItem(storageKey, JSON.stringify(item));
      
      this.stats.hits++;
      return item.data;
    } catch (error) {
      console.error('缓存解析失败:', error);
      localStorage.removeItem(storageKey);
      this.stats.misses++;
      return null;
    }
  }

  set<T>(key: string, data: T, ttl: number): void {
    const storageKey = this.prefix ? `${this.prefix}${key}` : key;
    const item: CacheItem<T> = {
      data,
      expiresAt: Date.now() + ttl,
      lastAccess: Date.now(),
      accessCount: 1
    };

    try {
      const existed = localStorage.getItem(storageKey) !== null;
      localStorage.setItem(storageKey, JSON.stringify(item));
      if (!existed) {
        this.stats.size++;
      }
    } catch (error) {
      // localStorage可能已满，尝试清理过期项
      console.warn('localStorage存储失败，尝试清理过期项:', error);
      this.cleanExpired();
      try {
        localStorage.setItem(storageKey, JSON.stringify(item));
      } catch (e) {
        console.error('存储失败:', e);
      }
    }
  }

  has(key: string): boolean {
    const storageKey = this.prefix ? `${this.prefix}${key}` : key;
    return localStorage.getItem(storageKey) !== null;
  }

  delete(key: string): void {
    const storageKey = this.prefix ? `${this.prefix}${key}` : key;
    if (localStorage.getItem(storageKey)) {
      localStorage.removeItem(storageKey);
      this.stats.size--;
    }
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    for (const key of keys) {
      if (this.prefix) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
          cleared++;
        }
      } else {
        // 如果没有前缀，只清理缓存相关的键
        if (key.startsWith('weather:') || key.startsWith('geocode:') || key.startsWith('cache:')) {
          localStorage.removeItem(key);
          cleared++;
        }
      }
    }
    this.stats.size -= cleared;
  }

  // 清理过期项
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      const shouldProcess = this.prefix 
        ? key.startsWith(this.prefix)
        : (key.startsWith('weather:') || key.startsWith('geocode:') || key.startsWith('cache:'));
      
      if (shouldProcess) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item: CacheItem<any> = JSON.parse(itemStr);
            if (now > item.expiresAt) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // 解析失败，删除该项
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    }

    this.stats.size -= cleaned;
    return cleaned;
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    const storageKeys = Object.keys(localStorage);
    
    if (this.prefix) {
      for (const key of storageKeys) {
        if (key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
    } else {
      // 如果没有前缀，返回所有非系统键
      // 排除已知的系统键（如 timearea_ 开头的应用数据）
      for (const key of storageKeys) {
        // 只返回缓存相关的键（weather:, geocode: 等）
        if (key.startsWith('weather:') || key.startsWith('geocode:') || key.startsWith('cache:')) {
          keys.push(key);
        }
      }
    }
    
    return keys;
  }

  getSize(): number {
    return this.getAllKeys().length;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // 获取缓存项详情
  getItemInfo(key: string): { expiresAt: number; lastAccess: number; accessCount: number } | null {
    const storageKey = this.prefix ? `${this.prefix}${key}` : key;
    const itemStr = localStorage.getItem(storageKey);
    
    if (!itemStr) return null;

    try {
      const item: CacheItem<any> = JSON.parse(itemStr);
      return {
        expiresAt: item.expiresAt,
        lastAccess: item.lastAccess,
        accessCount: item.accessCount
      };
    } catch {
      return null;
    }
  }
}

// 增强缓存管理器
class EnhancedCache {
  private l1Cache: MemoryCache;
  private l2Cache: StorageCache;
  private cachePrefix: string;

  constructor(l1MaxSize: number = 100, cachePrefix: string = '') {
    this.l1Cache = new MemoryCache(l1MaxSize);
    this.cachePrefix = cachePrefix;
    this.l2Cache = new StorageCache(cachePrefix);
    
    // 定期清理过期项
    setInterval(() => {
      this.cleanExpired();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 获取缓存
   * 先查L1，再查L2，如果L2命中则提升到L1
   */
  get<T>(key: string): T | null {
    // 先查L1
    const l1Data = this.l1Cache.get<T>(key);
    if (l1Data !== null) {
      return l1Data;
    }

    // 再查L2
    const l2Data = this.l2Cache.get<T>(key);
    if (l2Data !== null) {
      // 提升到L1（使用剩余TTL）
      const itemInfo = this.l2Cache.getItemInfo(key);
      if (itemInfo && itemInfo.expiresAt) {
        const remainingTTL = Math.max(itemInfo.expiresAt - Date.now(), 0);
        if (remainingTTL > 0) {
          this.l1Cache.set(key, l2Data, remainingTTL);
        }
      }
      return l2Data;
    }

    return null;
  }

  /**
   * 设置缓存
   * 同时写入L1和L2
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.l1Cache.set(key, data, ttl);
    this.l2Cache.set(key, data, ttl);
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    return this.l1Cache.has(key) || this.l2Cache.has(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.l1Cache.clear();
    this.l2Cache.clear();
  }

  /**
   * 清理过期项
   */
  cleanExpired(): number {
    const l1Cleaned = this.l1Cache.cleanExpired();
    const l2Cleaned = this.l2Cache.cleanExpired();
    return l1Cleaned + l2Cleaned;
  }

  /**
   * 获取所有缓存键
   */
  getAllKeys(): string[] {
    const l1Keys = this.l1Cache.getAllKeys();
    const l2Keys = this.l2Cache.getAllKeys();
    // 合并并去重
    return Array.from(new Set([...l1Keys, ...l2Keys]));
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const l1Stats = this.l1Cache.getStats();
    const l2Stats = this.l2Cache.getStats();
    
    return {
      l1: l1Stats,
      l2: l2Stats,
      total: {
        hits: l1Stats.hits + l2Stats.hits,
        misses: l1Stats.misses + l2Stats.misses,
        size: l1Stats.size + l2Stats.size,
        hitRate: (l1Stats.hits + l2Stats.hits) / (l1Stats.hits + l2Stats.hits + l1Stats.misses + l2Stats.misses) || 0
      }
    };
  }

  /**
   * 获取缓存项详情
   */
  getItemInfo(key: string) {
    if (this.l1Cache.has(key)) {
      // L1中的项，返回基本信息
      return {
        level: 'L1',
        exists: true
      };
    }
    
    const l2Info = this.l2Cache.getItemInfo(key);
    if (l2Info) {
      return {
        level: 'L2',
        exists: true,
        ...l2Info
      };
    }
    
    return { exists: false };
  }
}

// 创建默认实例（不使用前缀，保持与原有缓存键兼容）
const defaultCache = new EnhancedCache(100, 'cache:');

// 导出函数接口（兼容原有API）
export function getEnhancedCache<T>(key: string): T | null {
  return defaultCache.get<T>(key);
}

export function setEnhancedCache<T>(key: string, data: T, ttl: number): void {
  defaultCache.set(key, data, ttl);
}

export function removeEnhancedCache(key: string): void {
  defaultCache.delete(key);
}

export function clearEnhancedCache(): void {
  defaultCache.clear();
}

export function getCacheStats() {
  return defaultCache.getStats();
}

export function getAllCacheKeys(): string[] {
  return defaultCache.getAllKeys();
}

export function getCacheItemInfo(key: string) {
  return defaultCache.getItemInfo(key);
}

export function cleanExpiredCache(): number {
  return defaultCache.cleanExpired();
}

// 导出类，供高级用法
export { EnhancedCache, MemoryCache, StorageCache };
