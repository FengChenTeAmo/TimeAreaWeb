import { Route } from '../types/route';

const ROUTES_STORAGE_KEY = 'timearea_routes';

/**
 * 保存路线列表
 */
export function saveRoutes(routes: Route[]): void {
  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
}

/**
 * 获取路线列表
 */
export function getRoutes(): Route[] {
  const routesStr = localStorage.getItem(ROUTES_STORAGE_KEY);
  if (!routesStr) return [];
  
  try {
    return JSON.parse(routesStr);
  } catch (error) {
    console.error('路线数据解析失败:', error);
    return [];
  }
}

/**
 * 添加路线
 */
export function addRoute(route: Route): void {
  const routes = getRoutes();
  routes.push(route);
  saveRoutes(routes);
}

/**
 * 更新路线
 */
export function updateRoute(routeId: string, route: Route): void {
  const routes = getRoutes();
  const index = routes.findIndex(r => r.id === routeId);
  if (index !== -1) {
    routes[index] = route;
    saveRoutes(routes);
  }
}

/**
 * 删除路线
 */
export function deleteRoute(routeId: string): void {
  const routes = getRoutes();
  const filtered = routes.filter(r => r.id !== routeId);
  saveRoutes(filtered);
}

/**
 * 导出路线数据为JSON
 */
export function exportRoutes(): string {
  const routes = getRoutes();
  return JSON.stringify(routes, null, 2);
}

/**
 * 导入路线数据
 */
export function importRoutes(jsonStr: string): Route[] {
  try {
    const routes = JSON.parse(jsonStr) as Route[];
    saveRoutes(routes);
    return routes;
  } catch (error) {
    console.error('导入路线数据失败:', error);
    throw new Error('无效的JSON格式');
  }
}
