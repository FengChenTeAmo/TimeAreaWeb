import { QueryHistory, PopularLocation, QueryStatistics, HistoryCacheConfig } from '../types/history';
import { BatchQueryResult } from '../types/weather';
import { generateId } from './format';

// 存储键
const QUERY_HISTORY_KEY = 'timearea_query_history';
const POPULAR_LOCATIONS_KEY = 'timearea_popular_locations';
const QUERY_STATISTICS_KEY = 'timearea_query_statistics';

// 默认配置
const DEFAULT_CONFIG: HistoryCacheConfig = {
  maxHistoryRecords: 100,
  maxPopularLocations: 50,
  enableStatistics: true
};

/**
 * 获取查询历史记录
 */
export function getQueryHistory(): QueryHistory[] {
  const historyStr = localStorage.getItem(QUERY_HISTORY_KEY);
  if (!historyStr) return [];
  
  try {
    return JSON.parse(historyStr);
  } catch (error) {
    console.error('查询历史解析失败:', error);
    return [];
  }
}

/**
 * 保存查询历史记录
 */
function saveQueryHistory(history: QueryHistory[]): void {
  localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(history));
}

/**
 * 添加查询历史记录
 */
export function addQueryHistory(
  waypoints: Array<{ location: string; arrivalTime: string }>,
  results: BatchQueryResult[] | null,
  queryDuration: number,
  error?: string
): void {
  const history = getQueryHistory();
  const success = results !== null && results.length > 0;
  
  const newRecord: QueryHistory = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    waypoints: waypoints.map((wp, index) => ({
      location: wp.location,
      arrivalTime: wp.arrivalTime,
      weather: results?.[index]?.weather,
      geocode: results?.[index]?.geocode
    })),
    queryDuration,
    success,
    errorMessage: error
  };
  
  // 添加到开头（最新的在前面）
  history.unshift(newRecord);
  
  // 限制记录数量
  const config = DEFAULT_CONFIG;
  if (history.length > config.maxHistoryRecords) {
    history.splice(config.maxHistoryRecords);
  }
  
  saveQueryHistory(history);
  
  // 更新常用地点统计
  if (success && results) {
    updatePopularLocations(results);
  }
  
  // 更新查询统计
  if (config.enableStatistics) {
    updateQueryStatistics(success, queryDuration);
  }
}

/**
 * 删除查询历史记录
 */
export function deleteQueryHistory(historyId: string): void {
  const history = getQueryHistory();
  const filtered = history.filter(h => h.id !== historyId);
  saveQueryHistory(filtered);
}

/**
 * 批量删除查询历史记录
 */
export function deleteQueryHistoryBatch(historyIds: string[]): void {
  const history = getQueryHistory();
  const filtered = history.filter(h => !historyIds.includes(h.id));
  saveQueryHistory(filtered);
}

/**
 * 清空查询历史记录
 */
export function clearQueryHistory(): void {
  localStorage.removeItem(QUERY_HISTORY_KEY);
}

/**
 * 获取常用地点列表
 */
export function getPopularLocations(): PopularLocation[] {
  const locationsStr = localStorage.getItem(POPULAR_LOCATIONS_KEY);
  if (!locationsStr) return [];
  
  try {
    return JSON.parse(locationsStr);
  } catch (error) {
    console.error('常用地点解析失败:', error);
    return [];
  }
}

/**
 * 保存常用地点列表
 */
function savePopularLocations(locations: PopularLocation[]): void {
  localStorage.setItem(POPULAR_LOCATIONS_KEY, JSON.stringify(locations));
}

/**
 * 更新常用地点统计
 */
function updatePopularLocations(results: BatchQueryResult[]): void {
  const locations = getPopularLocations();
  const now = new Date().toISOString();
  
  results.forEach(result => {
    const existing = locations.find(loc => loc.location === result.location);
    
    if (existing) {
      // 更新现有地点
      existing.queryCount += 1;
      existing.lastQueryTime = now;
      existing.geocode = result.geocode;
    } else {
      // 添加新地点
      locations.push({
        location: result.location,
        geocode: result.geocode,
        queryCount: 1,
        lastQueryTime: now,
        firstQueryTime: now
      });
    }
  });
  
  // 按查询次数排序
  locations.sort((a, b) => b.queryCount - a.queryCount);
  
  // 限制数量
  const config = DEFAULT_CONFIG;
  if (locations.length > config.maxPopularLocations) {
    locations.splice(config.maxPopularLocations);
  }
  
  savePopularLocations(locations);
}

/**
 * 删除常用地点
 */
export function deletePopularLocation(location: string): void {
  const locations = getPopularLocations();
  const filtered = locations.filter(loc => loc.location !== location);
  savePopularLocations(filtered);
}

/**
 * 清空常用地点
 */
export function clearPopularLocations(): void {
  localStorage.removeItem(POPULAR_LOCATIONS_KEY);
}

/**
 * 获取查询统计信息
 */
export function getQueryStatistics(): QueryStatistics {
  const statsStr = localStorage.getItem(QUERY_STATISTICS_KEY);
  if (!statsStr) {
    return {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageQueryDuration: 0,
      lastQueryTime: null,
      firstQueryTime: null
    };
  }
  
  try {
    return JSON.parse(statsStr);
  } catch (error) {
    console.error('查询统计解析失败:', error);
    return {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageQueryDuration: 0,
      lastQueryTime: null,
      firstQueryTime: null
    };
  }
}

/**
 * 保存查询统计信息
 */
function saveQueryStatistics(stats: QueryStatistics): void {
  localStorage.setItem(QUERY_STATISTICS_KEY, JSON.stringify(stats));
}

/**
 * 更新查询统计信息
 */
function updateQueryStatistics(success: boolean, queryDuration: number): void {
  const stats = getQueryStatistics();
  const now = new Date().toISOString();
  
  stats.totalQueries += 1;
  if (success) {
    stats.successfulQueries += 1;
  } else {
    stats.failedQueries += 1;
  }
  
  // 计算平均查询耗时
  if (stats.totalQueries === 1) {
    stats.averageQueryDuration = queryDuration;
  } else {
    stats.averageQueryDuration = 
      (stats.averageQueryDuration * (stats.totalQueries - 1) + queryDuration) / stats.totalQueries;
  }
  
  stats.lastQueryTime = now;
  if (!stats.firstQueryTime) {
    stats.firstQueryTime = now;
  }
  
  saveQueryStatistics(stats);
}

/**
 * 重置查询统计信息
 */
export function resetQueryStatistics(): void {
  const defaultStats: QueryStatistics = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageQueryDuration: 0,
    lastQueryTime: null,
    firstQueryTime: null
  };
  saveQueryStatistics(defaultStats);
}

/**
 * 获取历史记录数量
 */
export function getHistoryCount(): number {
  return getQueryHistory().length;
}

/**
 * 根据时间范围筛选历史记录
 */
export function filterQueryHistoryByTimeRange(
  startTime: string,
  endTime: string
): QueryHistory[] {
  const history = getQueryHistory();
  return history.filter(h => {
    const timestamp = new Date(h.timestamp).getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return timestamp >= start && timestamp <= end;
  });
}

/**
 * 根据地点筛选历史记录
 */
export function filterQueryHistoryByLocation(location: string): QueryHistory[] {
  const history = getQueryHistory();
  return history.filter(h => 
    h.waypoints.some(wp => wp.location.includes(location))
  );
}
