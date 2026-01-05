/**
 * 位置相关工具函数
 */

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
}

/**
 * 获取GPS定位
 */
export function getCurrentLocation(): Promise<LocationInfo> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了地理定位请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * 反向地理编码（坐标转地址）
 * 使用百度地图API
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // 这里可以调用百度地图的反向地理编码API
  // 暂时返回坐标字符串
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
