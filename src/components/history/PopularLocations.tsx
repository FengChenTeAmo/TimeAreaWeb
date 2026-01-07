import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Empty, Space, Popconfirm, message } from 'antd';
import { ReloadOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';
import { PopularLocation } from '../../types/history';
import { 
  getPopularLocations, 
  deletePopularLocation, 
  clearPopularLocations 
} from '../../utils/historyCache';
import { formatDateTime } from '../../utils/format';

interface PopularLocationsProps {
  onSelectLocation?: (location: string) => void;
  maxDisplay?: number;
}

export const PopularLocations: React.FC<PopularLocationsProps> = ({ 
  onSelectLocation,
  maxDisplay = 10 
}) => {
  const [locations, setLocations] = useState<PopularLocation[]>([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = () => {
    const locationList = getPopularLocations();
    setLocations(locationList.slice(0, maxDisplay));
  };

  const handleDelete = (location: string) => {
    deletePopularLocation(location);
    loadLocations();
    message.success('删除成功');
  };

  const handleClearAll = () => {
    clearPopularLocations();
    setLocations([]);
    message.success('已清空所有常用地点');
  };

  const handleSelect = (location: string) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  if (locations.length === 0) {
    return (
      <Card 
        title={
          <Space>
            <StarOutlined />
            <span>常用地点</span>
          </Space>
        }
        extra={
          <Button 
            type="link" 
            onClick={loadLocations}
            icon={<ReloadOutlined />}
          >
            刷新
          </Button>
        }
      >
        <Empty description="暂无常用地点" />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <StarOutlined />
          <span>常用地点</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            type="link" 
            onClick={loadLocations}
            icon={<ReloadOutlined />}
          >
            刷新
          </Button>
          <Popconfirm
            title="确定要清空所有常用地点吗？"
            onConfirm={handleClearAll}
          >
            <Button type="link" danger>
              清空
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <List
        dataSource={locations}
        renderItem={(item, index) => (
          <List.Item
            style={{
              padding: '8px',
              border: '1px solid #f0f0f0',
              marginBottom: '4px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => handleSelect(item.location)}
            actions={[
              <Popconfirm
                key="delete"
                title="确定要删除这个地点吗？"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(item.location);
                }}
              >
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                >
                  删除
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <span>{item.location}</span>
                  <Tag color={index < 3 ? 'gold' : 'default'}>
                    查询 {item.queryCount} 次
                  </Tag>
                </Space>
              }
              description={
                <div style={{ fontSize: '12px', color: '#999' }}>
                  最后查询：{formatDateTime(item.lastQueryTime)}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
