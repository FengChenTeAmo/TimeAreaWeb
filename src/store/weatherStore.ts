import { create } from 'zustand';
import { BatchQueryResult } from '../types/weather';
import { batchQueryWeather } from '../services/weatherService';
import { addQueryHistory } from '../utils/historyCache';

interface WeatherStore {
  weatherData: BatchQueryResult[];
  loading: boolean;
  error: string | null;
  progress?: {
    current: number;
    total: number;
    currentLocation?: string;
  };
  queryWeather: (waypoints: Array<{ location: string; arrivalTime: string }>) => Promise<void>;
  clearWeather: () => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  weatherData: [],
  loading: false,
  error: null,
  progress: undefined,

  queryWeather: async (waypoints) => {
    const startTime = Date.now();
    set({ loading: true, error: null, progress: { current: 0, total: waypoints.length } });
    
    try {
      // 显示初始进度
      set({ 
        progress: { 
          current: 0, 
          total: waypoints.length,
          currentLocation: waypoints[0]?.location
        } 
      });
      
      const queryResults = await batchQueryWeather(waypoints);
      const queryDuration = Date.now() - startTime;
      
      // 记录查询历史
      addQueryHistory(waypoints, queryResults, queryDuration);
      
      set({ 
        weatherData: queryResults, 
        loading: false,
        progress: undefined
      });
    } catch (error: any) {
      const queryDuration = Date.now() - startTime;
      const errorMessage = error.message || '查询失败';
      
      // 记录失败的查询历史
      addQueryHistory(waypoints, null, queryDuration, errorMessage);
      
      set({ 
        error: errorMessage, 
        loading: false,
        weatherData: [],
        progress: undefined
      });
    }
  },

  clearWeather: () => {
    set({ weatherData: [], error: null, progress: undefined });
  }
}));
