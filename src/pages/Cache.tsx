import React from 'react';
import { Layout, Button, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CacheManager } from '../components/cache/CacheManager';
import { isMobile } from '../utils/mobile';

const { Content } = Layout;

export const Cache: React.FC = () => {
  const { t } = useTranslation(['common', 'cache']);
  const mobile = isMobile();
  const navigate = useNavigate();

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
                {t('cache:title')}
              </h1>
              <p style={{ 
                fontSize: mobile ? '14px' : '16px',
                color: '#666'
              }}>
                {t('cache:description')}
              </p>
            </div>
            <Button
              type="default"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              size={mobile ? 'middle' : 'large'}
            >
              {!mobile && t('common:home')}
            </Button>
          </div>
        </div>

        <CacheManager />
      </Content>
    </Layout>
  );
};
