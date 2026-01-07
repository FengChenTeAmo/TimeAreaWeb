import React from 'react';
import { Card, List, Tag, Space, Button, Descriptions } from 'antd';
import { Route } from '../../types/route';
import { getRouteStats } from '../../utils/routeUtils';
import { formatDateTime } from '../../utils/format';
import { isMobile } from '../../utils/mobile';

interface RouteDetailProps {
  route: Route;
  onEdit?: () => void;
  onQuery?: () => void;
}

export const RouteDetail: React.FC<RouteDetailProps> = ({ route, onEdit, onQuery }) => {
  const mobile = isMobile();
  const stats = getRouteStats(route);

  return (
    <div>
      {/* 路线基本信息 */}
      <Card
        title={route.name}
        extra={
          <Space>
            {route.isFavorite && <Tag color="gold">收藏</Tag>}
            {route.isTemplate && <Tag color="blue">模板</Tag>}
            {onEdit && (
              <Button type="primary" onClick={onEdit}>
                编辑
              </Button>
            )}
            {onQuery && (
              <Button type="default" onClick={onQuery}>
                查询天气
              </Button>
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={mobile ? 1 : 2} size="small">
          <Descriptions.Item label="经过点数量">{stats.waypointCount}</Descriptions.Item>
          {stats.startTime && (
            <Descriptions.Item label="开始时间">
              {formatDateTime(stats.startTime)}
            </Descriptions.Item>
          )}
          {stats.endTime && (
            <Descriptions.Item label="结束时间">
              {formatDateTime(stats.endTime)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">
            {formatDateTime(route.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDateTime(route.updatedAt)}
          </Descriptions.Item>
          {route.description && (
            <Descriptions.Item label="描述" span={mobile ? 1 : 2}>
              {route.description}
            </Descriptions.Item>
          )}
          {route.tags && route.tags.length > 0 && (
            <Descriptions.Item label="标签" span={mobile ? 1 : 2}>
              <Space wrap>
                {route.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 经过点列表 */}
      <Card title="经过点列表">
        <List
          dataSource={route.waypoints.sort((a, b) => a.order - b.order)}
          renderItem={(waypoint, index) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Tag color="blue">{index + 1}</Tag>
                    <span>{waypoint.location}</span>
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginTop: '4px' }}>
                      到达时间: {formatDateTime(waypoint.arrivalTime)}
                    </div>
                    {waypoint.weather && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Space>
                          <span>温度: {Math.round(waypoint.weather.temperature)}°C</span>
                          <span>天气: {waypoint.weather.weatherCondition}</span>
                          <span>湿度: {waypoint.weather.humidity}%</span>
                        </Space>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
