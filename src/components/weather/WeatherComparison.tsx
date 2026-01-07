import React from 'react';
import { Card, Table, Tag, Space } from 'antd';
import { BatchQueryResult } from '../../types/weather';
import { formatDateTime } from '../../utils/format';
import { isMobile } from '../../utils/mobile';

interface WeatherComparisonProps {
  data: BatchQueryResult[];
}

export const WeatherComparison: React.FC<WeatherComparisonProps> = ({ data }) => {
  const mobile = isMobile();

  if (data.length === 0) {
    return null;
  }

  // 计算统计数据
  const temperatures = data.map(item => item.weather.temperature);
  const humidities = data.map(item => item.weather.humidity);
  const windSpeeds = data.map(item => item.weather.windSpeed);
  const precipitations = data.map(item => item.weather.precipitation);

  const stats = {
    temperature: {
      max: Math.max(...temperatures),
      min: Math.min(...temperatures),
      avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length
    },
    humidity: {
      max: Math.max(...humidities),
      min: Math.min(...humidities),
      avg: humidities.reduce((a, b) => a + b, 0) / humidities.length
    },
    windSpeed: {
      max: Math.max(...windSpeeds),
      min: Math.min(...windSpeeds),
      avg: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
    },
    precipitation: {
      max: Math.max(...precipitations),
      min: Math.min(...precipitations),
      avg: precipitations.reduce((a, b) => a + b, 0) / precipitations.length
    }
  };

  // 找出极端天气
  const extremeWeather = {
    hottest: data.find(item => item.weather.temperature === stats.temperature.max),
    coldest: data.find(item => item.weather.temperature === stats.temperature.min),
    wettest: data.find(item => item.weather.precipitation === stats.precipitation.max),
    windiest: data.find(item => item.weather.windSpeed === stats.windSpeed.max)
  };

  const columns = [
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      fixed: mobile ? ('left' as const) : false,
      width: mobile ? 100 : 150,
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {formatDateTime(record.arrivalTime)}
          </div>
        </div>
      )
    },
    {
      title: '温度 (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      render: (temp: number) => {
        const isExtreme = temp === stats.temperature.max || temp === stats.temperature.min;
        return (
          <div>
            <span style={{ 
              fontWeight: 'bold',
              color: temp === stats.temperature.max ? '#ff4d4f' : 
                     temp === stats.temperature.min ? '#1890ff' : undefined
            }}>
              {Math.round(temp)}°C
            </span>
            {isExtreme && (
              <Tag color={temp === stats.temperature.max ? 'red' : 'blue'} style={{ marginLeft: 4 }}>
                {temp === stats.temperature.max ? '最高' : '最低'}
              </Tag>
            )}
          </div>
        );
      },
      sorter: (a: any, b: any) => 
        a.temperature - b.temperature
    },
    {
      title: '天气',
      dataIndex: 'weatherCondition',
      key: 'weatherCondition',
      width: 120,
      render: (text: string, record: any) => (
        <Space>
          {record.icon && (
            <img
              src={`https://cdn.heweather.com/cond_icon/${record.icon}.png`}
              alt={text}
              style={{ width: 24, height: 24 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '湿度 (%)',
      dataIndex: 'humidity',
      key: 'humidity',
      width: 100,
      render: (humidity: number) => (
        <span>{humidity}%</span>
      ),
      sorter: (a: any, b: any) => 
        a.humidity - b.humidity
    },
    {
      title: '风速 (m/s)',
      dataIndex: 'windSpeed',
      key: 'windSpeed',
      width: 100,
      render: (windSpeed: number) => {
        const isExtreme = windSpeed === stats.windSpeed.max;
        return (
          <div>
            <span style={{ 
              fontWeight: isExtreme ? 'bold' : 'normal',
              color: isExtreme ? '#faad14' : undefined
            }}>
              {windSpeed} m/s
            </span>
            {isExtreme && (
              <Tag color="orange" style={{ marginLeft: 4 }}>最大</Tag>
            )}
          </div>
        );
      },
      sorter: (a: any, b: any) => 
        a.windSpeed - b.windSpeed
    },
    {
      title: '降水 (mm)',
      dataIndex: 'precipitation',
      key: 'precipitation',
      width: 100,
      render: (precipitation: number) => {
        const isExtreme = precipitation === stats.precipitation.max && precipitation > 0;
        return (
          <div>
            <span style={{ 
              fontWeight: isExtreme ? 'bold' : 'normal',
              color: isExtreme ? '#52c41a' : undefined
            }}>
              {precipitation}mm
            </span>
            {isExtreme && (
              <Tag color="green" style={{ marginLeft: 4 }}>最多</Tag>
            )}
          </div>
        );
      },
      sorter: (a: any, b: any) => 
        a.precipitation - b.precipitation
    }
  ];

  const tableData = data.map((item, index) => ({
    key: index,
    location: item.location,
    temperature: item.weather.temperature,
    weatherCondition: item.weather.weatherCondition,
    humidity: item.weather.humidity,
    windSpeed: item.weather.windSpeed,
    precipitation: item.weather.precipitation,
    icon: item.weather.icon || '',
    arrivalTime: item.arrivalTime,
    // 保留原始数据用于排序
    _original: item
  }));

  return (
    <div>
      {/* 统计摘要 */}
      <Card title="天气对比统计" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>温度</div>
            <Space direction="vertical" size="small">
              <div>最高: <Tag color="red">{Math.round(stats.temperature.max)}°C</Tag> ({extremeWeather.hottest?.location})</div>
              <div>最低: <Tag color="blue">{Math.round(stats.temperature.min)}°C</Tag> ({extremeWeather.coldest?.location})</div>
              <div>平均: <Tag>{Math.round(stats.temperature.avg)}°C</Tag></div>
            </Space>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>湿度</div>
            <Space direction="vertical" size="small">
              <div>最高: <Tag>{Math.round(stats.humidity.max)}%</Tag></div>
              <div>最低: <Tag>{Math.round(stats.humidity.min)}%</Tag></div>
              <div>平均: <Tag>{Math.round(stats.humidity.avg)}%</Tag></div>
            </Space>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>风速</div>
            <Space direction="vertical" size="small">
              <div>最大: <Tag color="orange">{stats.windSpeed.max} m/s</Tag> ({extremeWeather.windiest?.location})</div>
              <div>最小: <Tag>{stats.windSpeed.min} m/s</Tag></div>
              <div>平均: <Tag>{Math.round(stats.windSpeed.avg * 10) / 10} m/s</Tag></div>
            </Space>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>降水</div>
            <Space direction="vertical" size="small">
              <div>最多: <Tag color="green">{stats.precipitation.max}mm</Tag> ({extremeWeather.wettest?.location})</div>
              <div>最少: <Tag>{stats.precipitation.min}mm</Tag></div>
              <div>平均: <Tag>{Math.round(stats.precipitation.avg * 10) / 10}mm</Tag></div>
            </Space>
          </div>
        </div>
      </Card>

      {/* 对比表格 */}
      <Card title="详细对比">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={mobile ? { x: 800 } : undefined}
          size="small"
        />
      </Card>
    </div>
  );
};
