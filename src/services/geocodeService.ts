import { GeocodeResult } from '../types/weather';
import { getCache, setCache } from '../utils/cache';

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;

/**
 * 初始化百度地图API（动态加载脚本）
 */
function loadBaiduMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if ((window as any).BMapGL) {
      resolve();
      return;
    }

    // 检查是否正在加载
    if ((window as any).__baiduMapLoading) {
      const checkInterval = setInterval(() => {
        if ((window as any).BMapGL) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    (window as any).__baiduMapLoading = true;

    // 创建全局回调函数
    const callbackName = `__baiduMapCallback_${Date.now()}`;
    (window as any)[callbackName] = () => {
      (window as any).__baiduMapLoading = false;
      delete (window as any)[callbackName];
      resolve();
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${MAP_API_KEY}&callback=${callbackName}`;

    script.onerror = () => {
      (window as any).__baiduMapLoading = false;
      delete (window as any)[callbackName];
      reject(new Error('加载百度地图API失败'));
    };

    document.head.appendChild(script);
  });
}

/**
 * 地理编码：地址转坐标（使用百度地图JavaScript API）
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  // 检查缓存
  const cacheKey = `geocode:${address}`;
  const cached = getCache<GeocodeResult>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 确保百度地图API已加载
    await loadBaiduMapScript();

    // 使用百度地图JavaScript API进行地理编码
    return new Promise((resolve, reject) => {
      const BMapGL = (window as any).BMapGL;
      if (!BMapGL) {
        reject(new Error('百度地图API未加载'));
        return;
      }

      const geocoder = new BMapGL.Geocoder();
      
      geocoder.getPoint(
        address,
        (point: any) => {
          if (point) {
            const result: GeocodeResult = {
              latitude: point.lat,
              longitude: point.lng,
              formattedAddress: address
            };

            // 永久缓存（地址基本不变）
            setCache(cacheKey, result, 365 * 24 * 60 * 60 * 1000);
            
            resolve(result);
          } else {
            reject(new Error(`地理编码失败：未找到地址"${address}"对应的坐标`));
          }
        },
        '' // 城市参数，空字符串表示全国搜索
      );
    });
  } catch (error: any) {
    throw new Error(`地理编码失败：${error.message || '未知错误'}`);
  }
}
