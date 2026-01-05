// 天气信息类型
export interface WeatherInfo {
  location: string;
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCondition: string;
  icon: string;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
}

// 地理编码结果类型
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

// 批量查询结果类型
export interface BatchQueryResult {
  location: string;
  geocode: GeocodeResult;
  arrivalTime: string;
  weather: WeatherInfo;
}
