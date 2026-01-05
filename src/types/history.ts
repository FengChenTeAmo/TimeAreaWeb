// 导入天气信息类型
import { WeatherInfo, GeocodeResult } from './weather';

// 查询历史记录
export interface QueryHistory {
  id: string;
  timestamp: string;              // 查询时间
  waypoints: Array<{              // 查询的经过点
    location: string;
    arrivalTime: string;
    weather?: WeatherInfo;
    geocode?: GeocodeResult;
  }>;
  queryDuration?: number;         // 查询耗时（毫秒）
  success: boolean;               // 是否成功
  errorMessage?: string;         // 错误信息（如果有）
}

// 常用地点统计
export interface PopularLocation {
  location: string;
  geocode?: GeocodeResult;
  queryCount: number;             // 查询次数
  lastQueryTime: string;          // 最后查询时间
  firstQueryTime: string;         // 首次查询时间
}

// 查询统计信息
export interface QueryStatistics {
  totalQueries: number;           // 总查询次数
  successfulQueries: number;      // 成功查询次数
  failedQueries: number;          // 失败查询次数
  averageQueryDuration: number;   // 平均查询耗时（毫秒）
  lastQueryTime: string | null;   // 最后查询时间
  firstQueryTime: string | null;  // 首次查询时间
}

// 历史缓存配置
export interface HistoryCacheConfig {
  maxHistoryRecords: number;      // 最大历史记录数
  maxPopularLocations: number;    // 最大常用地点数
  enableStatistics: boolean;       // 是否启用统计
}
