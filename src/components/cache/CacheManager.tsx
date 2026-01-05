import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Tag, 
  Statistic, 
  Row, 
  Col,
  Input,
  Select,
  Tooltip
} from 'antd';
import { 
  ReloadOutlined, 
  DeleteOutlined, 
  ClearOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  getAllCacheKeys, 
  getCacheItemInfo, 
  removeEnhancedCache, 
  clearEnhancedCache,
  cleanExpiredCache,
  getCacheStats
} from '../../utils/enhancedCache';
import { formatDateTime } from '../../utils/format';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

interface CacheItem {
  key: string;
  level: string;
  expiresAt?: number;
  lastAccess?: number;
  accessCount?: number;
  type: string;
}

export const CacheManager: React.FC = () => {
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CacheItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCacheData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [cacheItems, searchText, filterType]);

  const loadCacheData = () => {
    setLoading(true);
    try {
      const keys = getAllCacheKeys();
      const items: CacheItem[] = keys.map(key => {
        const info = getCacheItemInfo(key);
        let type = 'other';
        if (key.startsWith('weather:')) {
          type = 'weather';
        } else if (key.startsWith('geocode:')) {
          type = 'geocode';
        } else if (key.startsWith('timearea_')) {
          type = 'app';
        }

        return {
          key,
          level: info.level || 'L2',
          expiresAt: info.expiresAt,
          lastAccess: info.lastAccess,
          accessCount: info.accessCount,
          type
        };
      });

      // 按最后访问时间排序
      items.sort((a, b) => (b.lastAccess || 0) - (a.lastAccess || 0));
      
      setCacheItems(items);
      
      // 加载统计信息
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('加载缓存数据失败:', error);
      message.error('加载缓存数据失败');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...cacheItems];

    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // 按关键词搜索
    if (searchText) {
      filtered = filtered.filter(item => 
        item.key.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleDelete = (key: string) => {
    removeEnhancedCache(key);
    message.success('删除成功');
    loadCacheData();
  };

  const handleCleanExpired = () => {
    const cleaned = cleanExpiredCache();
    message.success(`已清理 ${cleaned} 个过期缓存项`);
    loadCacheData();
  };

  const handleClearAll = () => {
    clearEnhancedCache();
    message.success('已清空所有缓存');
    loadCacheData();
  };

  const handleClearByType = (type: string) => {
    const itemsToDelete = cacheItems.filter(item => item.type === type);
    itemsToDelete.forEach(item => removeEnhancedCache(item.key));
    message.success(`已清空 ${itemsToDelete.length} 个${getTypeName(type)}缓存`);
    loadCacheData();
  };

  const getTypeName = (type: string): string => {
    const names: Record<string, string> = {
      weather: '天气',
      geocode: '地理编码',
      app: '应用数据',
      other: '其他'
    };
    return names[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      weather: 'blue',
      geocode: 'green',
      app: 'orange',
      other: 'default'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: '缓存键',
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeName(type)}</Tag>
      )
    },
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => (
        <Tag color={level === 'L1' ? 'gold' : 'cyan'}>{level}</Tag>
      )
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 180,
      render: (expiresAt: number | undefined) => {
        if (!expiresAt) return '-';
        const isExpired = Date.now() > expiresAt;
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : '#52c41a' }}>
            {formatDateTime(new Date(expiresAt).toISOString())}
            {isExpired && <Tag color="red" style={{ marginLeft: 8 }}>已过期</Tag>}
          </span>
        );
      }
    },
    {
      title: '最后访问',
      dataIndex: 'lastAccess',
      key: 'lastAccess',
      width: 180,
      render: (lastAccess: number | undefined) => {
        if (!lastAccess) return '-';
        return formatDateTime(new Date(lastAccess).toISOString());
      }
    },
    {
      title: '访问次数',
      dataIndex: 'accessCount',
      key: 'accessCount',
      width: 100,
      render: (count: number | undefined) => count || 0
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: CacheItem) => (
        <Popconfirm
          title="确定要删除这个缓存项吗？"
          onConfirm={() => handleDelete(record.key)}
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      {/* 统计信息 */}
      {stats && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="L1缓存命中"
                value={stats.l1.hits}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="L2缓存命中"
                value={stats.l2.hits}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="总命中率"
                value={(stats.total.hitRate * 100).toFixed(1)}
                suffix="%"
                valueStyle={{ 
                  color: stats.total.hitRate >= 0.8 ? '#3f8600' : 
                         stats.total.hitRate >= 0.5 ? '#faad14' : '#cf1322' 
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="缓存项总数"
                value={stats.total.size}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* 操作栏 */}
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Search
              placeholder="搜索缓存键"
              allowClear
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
            >
              <Option value="all">全部类型</Option>
              <Option value="weather">天气</Option>
              <Option value="geocode">地理编码</Option>
              <Option value="app">应用数据</Option>
              <Option value="other">其他</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCacheData}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
          <Space>
            <Popconfirm
              title="确定要清理所有过期缓存吗？"
              onConfirm={handleCleanExpired}
            >
              <Button icon={<ClearOutlined />}>
                清理过期
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确定要清空所有缓存吗？此操作不可恢复！"
              onConfirm={handleClearAll}
            >
              <Button danger icon={<ClearOutlined />}>
                清空全部
              </Button>
            </Popconfirm>
          </Space>
        </Space>

        {/* 快速清理 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <span>快速清理：</span>
          <Button size="small" onClick={() => handleClearByType('weather')}>
            清空天气缓存
          </Button>
          <Button size="small" onClick={() => handleClearByType('geocode')}>
            清空地理编码缓存
          </Button>
          <Button size="small" onClick={() => handleClearByType('app')}>
            清空应用数据缓存
          </Button>
        </Space>

        {/* 缓存列表 */}
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="key"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};
