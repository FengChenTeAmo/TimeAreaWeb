import React from 'react';
import { Progress, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingProgressProps {
  current: number;
  total: number;
  currentLocation?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  current,
  total,
  currentLocation
}) => {
  const percent = Math.round((current / total) * 100);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Progress
          percent={percent}
          status="active"
          format={() => `${current}/${total}`}
        />
        {currentLocation && (
          <Text type="secondary">
            <LoadingOutlined /> 正在查询: {currentLocation}
          </Text>
        )}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          请稍候，正在获取天气信息...
        </Text>
      </Space>
    </div>
  );
};
