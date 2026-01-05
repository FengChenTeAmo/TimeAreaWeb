import React from 'react';
import { Layout, Tabs, Button, Space } from 'antd';
import { HistoryOutlined, StarOutlined, BarChartOutlined, DatabaseOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { QueryHistoryList } from '../components/history/QueryHistoryList';
import { PopularLocations } from '../components/history/PopularLocations';
import { StatisticsPanel } from '../components/history/StatisticsPanel';
import { isMobile } from '../utils/mobile';

const { Content } = Layout;

export const History: React.FC = () => {
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
                历史记录
              </h1>
              <p style={{ 
                fontSize: mobile ? '14px' : '16px',
                color: '#666'
              }}>
                查看查询历史、常用地点和统计信息
              </p>
            </div>
            <Space>
              <Button
                type="default"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && '返回首页'}
              </Button>
              <Button
                type="default"
                icon={<DatabaseOutlined />}
                onClick={() => navigate('/cache')}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && '缓存管理'}
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
                  {!mobile && ' 查询历史'}
                </span>
              ),
              children: <QueryHistoryList onSelectHistory={handleSelectHistory} />
            },
            {
              key: 'locations',
              label: (
                <span>
                  <StarOutlined />
                  {!mobile && ' 常用地点'}
                </span>
              ),
              children: <PopularLocations onSelectLocation={handleSelectLocation} />
            },
            {
              key: 'statistics',
              label: (
                <span>
                  <BarChartOutlined />
                  {!mobile && ' 统计信息'}
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
