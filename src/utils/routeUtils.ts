import { Route, Waypoint } from '../types/route';
import { generateId } from './format';
import dayjs from 'dayjs';

/**
 * 生成路线分享链接
 */
export function generateShareLink(route: Route): string {
  const shareData = {
    name: route.name,
    waypoints: route.waypoints.map(wp => ({
      location: wp.location,
      arrivalTime: wp.arrivalTime
    }))
  };
  
  // 使用 base64 编码分享数据
  const encoded = btoa(JSON.stringify(shareData));
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
  
  return shareUrl;
}

/**
 * 从分享链接解析路线数据
 */
export function parseShareLink(shareData: string): { name: string; waypoints: Array<{ location: string; arrivalTime: string }> } | null {
  try {
    const decoded = atob(shareData);
    const data = JSON.parse(decoded);
    return data;
  } catch (error) {
    console.error('解析分享链接失败:', error);
    return null;
  }
}

/**
 * 从分享数据创建路线
 */
export function createRouteFromShare(shareData: { name: string; waypoints: Array<{ location: string; arrivalTime: string }> }): Omit<Route, 'id' | 'createdAt' | 'updatedAt'> {
  const waypoints: Waypoint[] = shareData.waypoints.map((wp, index) => ({
    id: generateId(),
    location: wp.location,
    arrivalTime: wp.arrivalTime,
    order: index
  }));

  return {
    name: shareData.name || '导入的路线',
    waypoints,
    isTemplate: false,
    isFavorite: false
  };
}

/**
 * 复制路线
 */
export function duplicateRoute(route: Route): Omit<Route, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: `${route.name} (副本)`,
    waypoints: route.waypoints.map(wp => ({
      ...wp,
      id: generateId()
    })),
    isTemplate: route.isTemplate || false,
    isFavorite: false,
    tags: route.tags ? [...route.tags] : undefined,
    description: route.description
  };
}

/**
 * 搜索路线
 */
export function searchRoutes(routes: Route[], keyword: string): Route[] {
  if (!keyword.trim()) {
    return routes;
  }

  const lowerKeyword = keyword.toLowerCase();
  return routes.filter(route => {
    // 搜索路线名称
    if (route.name.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 搜索描述
    if (route.description && route.description.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 搜索标签
    if (route.tags && route.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
      return true;
    }

    // 搜索地点
    if (route.waypoints.some(wp => wp.location.toLowerCase().includes(lowerKeyword))) {
      return true;
    }

    return false;
  });
}

/**
 * 按时间范围筛选路线
 */
export function filterRoutesByTimeRange(
  routes: Route[],
  startTime: string,
  endTime: string
): Route[] {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  return routes.filter(route => {
    return route.waypoints.some(wp => {
      const wpTime = dayjs(wp.arrivalTime);
      return wpTime.isAfter(start) && wpTime.isBefore(end);
    });
  });
}

/**
 * 排序路线
 */
export function sortRoutes(routes: Route[], sortBy: 'name' | 'createdAt' | 'updatedAt' | 'favorite' = 'updatedAt'): Route[] {
  const sorted = [...routes];

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'createdAt':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'updatedAt':
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case 'favorite':
      sorted.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      break;
  }

  return sorted;
}

/**
 * 获取路线统计信息
 */
export function getRouteStats(route: Route): {
  waypointCount: number;
  totalDistance?: number;
  totalDuration?: number;
  startTime?: string;
  endTime?: string;
} {
  const waypointCount = route.waypoints.length;
  
  const times = route.waypoints
    .map(wp => dayjs(wp.arrivalTime))
    .sort((a, b) => a.valueOf() - b.valueOf());

  return {
    waypointCount,
    startTime: times.length > 0 ? times[0].toISOString() : undefined,
    endTime: times.length > 0 ? times[times.length - 1].toISOString() : undefined
  };
}

/**
 * 验证路线数据
 */
export function validateRoute(route: Partial<Route>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!route.name || route.name.trim().length === 0) {
    errors.push('路线名称不能为空');
  }

  if (!route.waypoints || route.waypoints.length === 0) {
    errors.push('路线至少需要一个经过点');
  } else {
    route.waypoints.forEach((wp, index) => {
      if (!wp.location || wp.location.trim().length === 0) {
        errors.push(`第${index + 1}个经过点的地点不能为空`);
      }
      if (!wp.arrivalTime) {
        errors.push(`第${index + 1}个经过点的到达时间不能为空`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
