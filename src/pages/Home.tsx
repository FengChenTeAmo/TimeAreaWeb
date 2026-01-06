import React, { useEffect, useState } from 'react';
import { Layout, message, Button, Space } from 'antd';
import { HistoryOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RouteInput } from '../components/route/RouteInput';
import { EnhancedWeatherDisplay } from '../components/weather/EnhancedWeatherDisplay';
import { WeatherComparison } from '../components/weather/WeatherComparison';
import { LoadingProgress } from '../components/common/LoadingProgress';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { useWeatherStore } from '../store/weatherStore';
import { isMobile } from '../utils/mobile';

const { Content } = Layout;

export const Home: React.FC = () => {
  const { t } = useTranslation(['common', 'home']);
  const { weatherData, loading, error, progress, queryWeather, clearWeather } = useWeatherStore();
  const [mobile, setMobile] = useState(isMobile());
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleQuery = async (waypoints: Array<{ location: string; arrivalTime: string }>) => {
    clearWeather();
    await queryWeather(waypoints);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content 
        style={{ 
          padding: mobile ? '16px' : '24px', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%' 
        }}
      >
        <div style={{ marginBottom: mobile ? 16 : 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ 
                fontSize: mobile ? '24px' : '32px',
                marginBottom: mobile ? 8 : 12,
                fontWeight: 'bold'
              }}>
                {t('home:title')}
              </h1>
              <p style={{ 
                fontSize: mobile ? '14px' : '16px',
                color: '#666'
              }}>
                {t('home:description')}
              </p>
            </div>
            <Space>
              <LanguageSwitcher />
              <Button
                type="default"
                icon={<GlobalOutlined />}
                onClick={() => navigate('/routes')}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && t('home:routeManagement')}
              </Button>
              <Button
                type="default"
                icon={<HistoryOutlined />}
                onClick={() => navigate('/history')}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && t('home:history')}
              </Button>
            </Space>
          </div>
        </div>
        
        <div style={{ 
          marginBottom: mobile ? 16 : 24, 
          padding: mobile ? '16px' : '24px', 
          background: '#fff', 
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <RouteInput onQuery={handleQuery} loading={loading} />
        </div>

        {loading && progress && (
          <div style={{ 
            padding: mobile ? '16px' : '24px', 
            background: '#fff', 
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: mobile ? 16 : 24
          }}>
            <LoadingProgress 
              current={progress.current}
              total={progress.total}
              currentLocation={progress.currentLocation}
            />
          </div>
        )}

        {weatherData.length > 0 && (
          <>
            <div style={{ 
              padding: mobile ? '16px' : '24px', 
              background: '#fff', 
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: mobile ? 16 : 24
            }}>
              <EnhancedWeatherDisplay 
                data={weatherData} 
                loading={loading}
                onCopy={() => {
                  message.success(t('common:success'));
                }}
                onShare={() => {
                  message.success(t('common:success'));
                }}
              />
            </div>
            {weatherData.length > 1 && (
              <div style={{ 
                padding: mobile ? '16px' : '24px', 
                background: '#fff', 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <WeatherComparison data={weatherData} />
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};
