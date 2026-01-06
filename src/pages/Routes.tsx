import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Button, Modal, message, Space } from 'antd';
import { PlusOutlined, GlobalOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RouteList } from '../components/route/RouteList';
import { Route } from '../types/route';
import { useRouteStore } from '../store/routeStore';
import { parseShareLink, createRouteFromShare } from '../utils/routeUtils';
import { isMobile } from '../utils/mobile';

const { Content } = Layout;

export const Routes: React.FC = () => {
  const { t } = useTranslation(['common', 'routes']);
  const mobile = isMobile();
  const navigate = useNavigate();
  const { addRoute } = useRouteStore();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // 检查URL参数中是否有分享的路线
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    
    if (shareData) {
      const parsed = parseShareLink(shareData);
      if (parsed) {
        Modal.confirm({
          title: t('routes:createRoute'),
          content: `${t('routes:createRoute')}: "${parsed.name}"?`,
          onOk: () => {
            try {
              const newRoute = createRouteFromShare(parsed);
              addRoute(newRoute);
              message.success(t('common:success'));
              // 清除URL参数
              window.history.replaceState({}, '', window.location.pathname);
            } catch (error: any) {
              message.error(`${t('common:error')}: ${error.message}`);
            }
          },
          onCancel: () => {
            // 清除URL参数
            window.history.replaceState({}, '', window.location.pathname);
          }
        });
      }
    }
  }, [addRoute]);

  const handleSelectRoute = (route: Route) => {
    // 可以跳转到路线详情页面
    console.log('选择路线:', route);
  };

  const handleEditRoute = (route: Route) => {
    // 可以跳转到路线编辑页面
    console.log('编辑路线:', route);
  };

  const handleCreateRoute = () => {
    // 跳转到首页创建新路线
    navigate('/');
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
                {t('routes:title')}
              </h1>
              <p style={{ 
                fontSize: mobile ? '14px' : '16px',
                color: '#666'
              }}>
                {t('routes:description')}
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
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateRoute}
                size={mobile ? 'middle' : 'large'}
              >
                {!mobile && t('routes:createRoute')}
              </Button>
            </Space>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <GlobalOutlined />
                  {!mobile && ` ${t('routes:allRoutes')}`}
                </span>
              ),
              children: (
                <RouteList 
                  onSelectRoute={handleSelectRoute}
                  onEditRoute={handleEditRoute}
                />
              )
            }
          ]}
        />
      </Content>
    </Layout>
  );
};
