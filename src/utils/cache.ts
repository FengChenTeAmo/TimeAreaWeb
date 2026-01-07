// 使用增强缓存系统，保持向后兼容
import { 
  getEnhancedCache, 
  setEnhancedCache, 
  removeEnhancedCache as removeEnhancedCacheInternal
} from './enhancedCache';

/**
 * 设置缓存
 * @param key 缓存键
 * @param data 缓存数据
 * @param ttl 过期时间（毫秒）
 */
export function setCache<T>(key: string, data: T, ttl: number): void {
  setEnhancedCache(key, data, ttl);
}

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 缓存数据，如果不存在或已过期返回null
 */
export function getCache<T>(key: string): T | null {
  return getEnhancedCache<T>(key);
}

/**
 * 删除缓存
 * @param key 缓存键
 */
export function removeCache(key: string): void {
  removeEnhancedCacheInternal(key);
}

/**
 * 清空所有缓存
 */
export function clearCache(): void {
  // 为了保持向后兼容，只清空 weather 和 geocode 相关的缓存
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('weather:') || key.startsWith('geocode:')) {
      removeEnhancedCacheInternal(key);
    }
  });
}
