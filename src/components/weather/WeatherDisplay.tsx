import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Spin } from 'antd';
import { BatchQueryResult } from '../../types/weather';
import { formatDateTime } from '../../utils/format';
import { isMobile } from '../../utils/mobile';

interface WeatherDisplayProps {
  data: BatchQueryResult[];
  loading?: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data, loading }) => {
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: mobile ? '30px' : '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: mobile ? '30px' : '50px', color: '#999' }}>
        暂无天气数据
      </div>
    );
  }

  return (
    <Row gutter={[mobile ? 12 : 16, mobile ? 12 : 16]}>
      {data.map((item, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <Card
            title={item.location}
            extra={<Tag color="blue">{formatDateTime(item.arrivalTime)}</Tag>}
            hoverable={!mobile}
            style={{ height: '100%' }}
          >
            <div className="weather-info">
              <div style={{ textAlign: 'center', marginBottom: mobile ? 12 : 16 }}>
                <div style={{ 
                  fontSize: mobile ? 36 : 48, 
                  fontWeight: 'bold', 
                  color: '#1890ff' 
                }}>
                  {Math.round(item.weather.temperature)}°C
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: mobile ? 12 : 16 }}>
                <img
                  src={`https://cdn.heweather.com/cond_icon/${item.weather.icon}.png`}
                  alt={item.weather.weatherCondition}
                  style={{ width: mobile ? 48 : 64, height: mobile ? 48 : 64 }}
                />
                <div style={{ fontSize: mobile ? 13 : 14, marginTop: 4 }}>
                  {item.weather.weatherCondition}
                </div>
              </div>
              <div style={{ fontSize: mobile ? 12 : 14, color: '#666' }}>
                <div style={{ marginBottom: 4 }}>湿度: {item.weather.humidity}%</div>
                <div style={{ marginBottom: 4 }}>风速: {item.weather.windSpeed} m/s</div>
                <div style={{ marginBottom: 4 }}>降水: {item.weather.precipitation}mm</div>
                {item.weather.feelsLike && (
                  <div>体感: {Math.round(item.weather.feelsLike)}°C</div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
