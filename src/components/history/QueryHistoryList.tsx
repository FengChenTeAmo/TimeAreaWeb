import React, { useState, useEffect } from 'react';
import { Card, List, Button, Popconfirm, Empty, Tag, Space, message } from 'antd';
import { DeleteOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { QueryHistory } from '../../types/history';
import { 
  getQueryHistory, 
  deleteQueryHistory, 
  deleteQueryHistoryBatch, 
  clearQueryHistory 
} from '../../utils/historyCache';
import { formatDateTime } from '../../utils/format';
import { useWeatherStore } from '../../store/weatherStore';
import dayjs from 'dayjs';

interface QueryHistoryListProps {
  onSelectHistory?: (history: QueryHistory) => void;
}

export const QueryHistoryList: React.FC<QueryHistoryListProps> = ({ onSelectHistory }) => {
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { queryWeather } = useWeatherStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyList = getQueryHistory();
    setHistory(historyList);
  };

  const handleDelete = (id: string) => {
    deleteQueryHistory(id);
    loadHistory();
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    deleteQueryHistoryBatch(selectedIds);
    setSelectedIds([]);
    loadHistory();
    message.success(`已删除 ${selectedIds.length} 条记录`);
  };

  const handleClearAll = () => {
    clearQueryHistory();
    setHistory([]);
    setSelectedIds([]);
    message.success('已清空所有历史记录');
  };

  const handleReplay = async (historyItem: QueryHistory) => {
    const waypoints = historyItem.waypoints.map(wp => ({
      location: wp.location,
      arrivalTime: wp.arrivalTime
    }));
    
    try {
      await queryWeather(waypoints);
      message.success('查询成功');
      if (onSelectHistory) {
        onSelectHistory(historyItem);
      }
    } catch (error: any) {
      message.error(`查询失败: ${error.message}`);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (history.length === 0) {
    return (
      <Card title="查询历史" extra={
        <Button 
          type="link" 
          onClick={loadHistory}
          icon={<ReloadOutlined />}
        >
          刷新
        </Button>
      }>
        <Empty description="暂无查询历史" />
      </Card>
    );
  }

  return (
    <Card 
      title="查询历史" 
      extra={
        <Space>
          <Button 
            type="link" 
            onClick={loadHistory}
            icon={<ReloadOutlined />}
          >
            刷新
          </Button>
          {selectedIds.length > 0 && (
            <Popconfirm
              title={`确定要删除选中的 ${selectedIds.length} 条记录吗？`}
              onConfirm={handleBatchDelete}
            >
              <Button type="link" danger>
                批量删除
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要清空所有历史记录吗？此操作不可恢复！"
            onConfirm={handleClearAll}
          >
            <Button type="link" danger>
              清空全部
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <List
        dataSource={history}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '12px',
              border: selectedIds.includes(item.id) ? '2px solid #1890ff' : '1px solid #f0f0f0',
              marginBottom: '8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => toggleSelect(item.id)}
            actions={[
              <Button
                key="replay"
                type="link"
                icon={<ReloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay(item);
                }}
              >
                重新查询
              </Button>,
              <Popconfirm
                key="delete"
                title="确定要删除这条记录吗？"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(item.id);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="link"
                  danger
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
                  <Tag color={item.success ? 'success' : 'error'}>
                    {item.success ? '成功' : '失败'}
                  </Tag>
                  <span>{formatDateTime(item.timestamp)}</span>
                  {item.queryDuration && (
                    <Tag icon={<ClockCircleOutlined />}>
                      {item.queryDuration}ms
                    </Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>经过点：</strong>
                    {item.waypoints.map((wp, index) => (
                      <Tag key={index} style={{ marginTop: '4px' }}>
                        {wp.location} ({dayjs(wp.arrivalTime).format('YYYY-MM-DD HH:mm')})
                      </Tag>
                    ))}
                  </div>
                  {item.errorMessage && (
                    <div style={{ marginTop: '8px', color: '#ff4d4f' }}>
                      <strong>错误：</strong>{item.errorMessage}
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
