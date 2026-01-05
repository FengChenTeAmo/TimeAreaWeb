// 导入天气信息类型
import { WeatherInfo } from './weather';

// 经过点类型
export interface Waypoint {
  id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  arrivalTime: string;
  order: number;
  weather?: WeatherInfo;
}

// 路线类型
export interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;      // 是否为模板
  isFavorite?: boolean;      // 是否收藏
  tags?: string[];           // 标签
  description?: string;      // 描述
  shareId?: string;          // 分享ID
}
