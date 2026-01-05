import axios from 'axios';
import { WeatherInfo, BatchQueryResult } from '../types/weather';
import { geocodeAddress } from './geocodeService';
import { getCache, setCache } from '../utils/cache';
import dayjs from 'dayjs';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
// 使用和风天气专属API域名
const WEATHER_API_BASE_URL = import.meta.env.DEV
  ? '/api/weather/v7'
  : 'https://nu3yfrjy6b.re.qweatherapi.com/v7';

/**
 * 查询天气
 */
export async function getWeather(
  latitude: number,
  longitude: number,
  date: string,
  time: string
): Promise<WeatherInfo> {
  // 检查缓存
  const cacheKey = `weather:${latitude}:${longitude}:${date}:${time}`;
  const cached = getCache<WeatherInfo>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 和风天气API：直接使用经纬度查询7天天气预报（v7版本支持经纬度）
    const location = `${longitude},${latitude}`;
    
    // 查询7天天气预报（直接使用经纬度）
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather/7d`, {
      params: {
        location: location,
        key: WEATHER_API_KEY
      }
    });

    if (response.data.code !== '200') {
      throw new Error(`天气查询失败：${response.data.message || 'API错误'}`);
    }

    // 找到目标日期对应的天气数据
    const targetDate = dayjs(date);
    const dailyForecast = response.data.daily.find((item: any) => {
      const forecastDate = dayjs(item.fxDate);
      return forecastDate.isSame(targetDate, 'day');
    });

    if (!dailyForecast) {
      throw new Error('天气查询失败：未找到对应日期的预报数据');
    }

    // 从响应中获取城市名称（如果有的话）
    const cityName = response.data.refer?.sources?.[0] || '未知位置';

    const weatherData: WeatherInfo = {
      location: cityName,
      date: date,
      time: time,
      temperature: parseFloat(dailyForecast.tempMax),
      humidity: parseFloat(dailyForecast.humidity),
      windSpeed: parseFloat(dailyForecast.windSpeedDay),
      precipitation: parseFloat(dailyForecast.precip),
      weatherCondition: dailyForecast.textDay,
      icon: dailyForecast.iconDay,
      feelsLike: parseFloat(dailyForecast.tempMax),
      pressure: dailyForecast.pressure ? parseFloat(dailyForecast.pressure) : undefined,
      visibility: undefined
    };

    // 缓存2小时
    setCache(cacheKey, weatherData, 2 * 60 * 60 * 1000);

    return weatherData;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`天气查询失败：${error.response.data?.message || 'API错误'}`);
    }
    throw new Error(`天气查询失败：${error.message || '网络错误'}`);
  }
}

/**
 * 批量查询天气
 */
export async function batchQueryWeather(
  waypoints: Array<{ location: string; arrivalTime: string }>
): Promise<BatchQueryResult[]> {
  const promises = waypoints.map(async (waypoint) => {
    const { location, arrivalTime } = waypoint;
    
    // 地理编码
    const geocode = await geocodeAddress(location);
    
    // 解析时间
    const dateTime = dayjs(arrivalTime);
    const date = dateTime.format('YYYY-MM-DD');
    const time = dateTime.format('HH:mm');
    
    // 查询天气
    const weather = await getWeather(
      geocode.latitude,
      geocode.longitude,
      date,
      time
    );
    
    return {
      location,
      geocode,
      arrivalTime,
      weather
    };
  });
  
  return Promise.all(promises);
}
