// 百度地图JavaScript API类型定义
declare namespace BMapGL {
  class Point {
    lng: number;
    lat: number;
    constructor(lng: number, lat: number);
  }

  class Geocoder {
    getPoint(
      address: string,
      callback: (point: Point | null) => void,
      city?: string
    ): void;
  }
}

// 扩展Window接口
declare global {
  interface Window {
    BMapGL: typeof BMapGL;
    __baiduMapCallback?: () => void;
    __baiduMapLoading?: boolean;
  }
}
