import React from 'react';
import { Layout, Tabs, Button, Space } from 'antd';
import { HistoryOutlined, StarOutlined, BarChartOutlined, DatabaseOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QueryHistoryList } from '../components/history/QueryHistoryList';
import { PopularLocations } from '../components/history/PopularLocations';
import { StatisticsPanel } from '../components/history/StatisticsPanel';
import { isMobile } from '../utils/mobile';

const { Content } = Layout;

export const History: React.FC = () => {
  const { t } = useTranslation(['common', 'history', 'cache']);
  const mobile = isMobile();
  const navigate = useNavigate();

  const handleSelectHistory = (history: any) => {
    // 可以在这里处理历史记录选择，比如跳转到查询页面并填充数据
    console.log('选择历史记录:', history);
  };

  const handleSelectLocation = (location: string) => {
    // 可以在这里处理地点选择，比如跳转到查询页面并填充地点
    console.log('选择地点:', location);
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
                {t('history:title')}
              </h1>
              <p style={{ 
                fontSize: mobile ? '14px' : '16px',
                color: '#666'
              }}>
                {t('history:description')}
              </p>
            </div>
            <Space>
              <Button
                type="default"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && t('common:home')}
              </Button>
              <Button
                type="default"
                icon={<DatabaseOutlined />}
                onClick={() => navigate('/cache')}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && t('cache:title')}
              </Button>
            </Space>
          </div>
        </div>

        <Tabs
          defaultActiveKey="history"
          items={[
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined />
                  {!mobile && ` ${t('history:queryHistory')}`}
                </span>
              ),
              children: <QueryHistoryList onSelectHistory={handleSelectHistory} />
            },
            {
              key: 'locations',
              label: (
                <span>
                  <StarOutlined />
                  {!mobile && ` ${t('history:popularLocations')}`}
                </span>
              ),
              children: <PopularLocations onSelectLocation={handleSelectLocation} />
            },
            {
              key: 'statistics',
              label: (
                <span>
                  <BarChartOutlined />
                  {!mobile && ` ${t('history:statistics')}`}
                </span>
              ),
              children: <StatisticsPanel />
            }
          ]}
        />
      </Content>
    </Layout>
  );
};
