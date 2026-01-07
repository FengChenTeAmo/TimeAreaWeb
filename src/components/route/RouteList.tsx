import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Popconfirm, 
  message,
  Empty,
  Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  StarOutlined, 
  StarFilled,
  CopyOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Route } from '../../types/route';
import { useRouteStore } from '../../store/routeStore';
import { searchRoutes, sortRoutes, generateShareLink } from '../../utils/routeUtils';
import { formatDateTime } from '../../utils/format';
import { isMobile } from '../../utils/mobile';

const { Search } = Input;
const { Option } = Select;

interface RouteListProps {
  onSelectRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
}

export const RouteList: React.FC<RouteListProps> = ({ onSelectRoute, onEditRoute }) => {
  const { routes, loadRoutes, deleteRoute, toggleFavorite, setAsTemplate, duplicateRoute } = useRouteStore();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'favorite'>('updatedAt');
  const [filterFavorite, setFilterFavorite] = useState<boolean | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<boolean | null>(null);
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = (routeId: string) => {
    deleteRoute(routeId);
    message.success('删除成功');
  };

  const handleToggleFavorite = (routeId: string) => {
    toggleFavorite(routeId);
    message.success('操作成功');
  };

  const handleSetTemplate = (routeId: string, isTemplate: boolean) => {
    setAsTemplate(routeId, isTemplate);
    message.success(isTemplate ? '已设为模板' : '已取消模板');
  };

  const handleDuplicate = (routeId: string) => {
    duplicateRoute(routeId);
    message.success('复制成功');
  };

  const handleShare = (route: Route) => {
    const shareUrl = generateShareLink(route);
    navigator.clipboard.writeText(shareUrl).then(() => {
      message.success('分享链接已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 筛选和排序
  let filteredRoutes = searchRoutes(routes, searchText);
  
  if (filterFavorite !== null) {
    filteredRoutes = filteredRoutes.filter(r => r.isFavorite === filterFavorite);
  }
  
  if (filterTemplate !== null) {
    filteredRoutes = filteredRoutes.filter(r => r.isTemplate === filterTemplate);
  }

  filteredRoutes = sortRoutes(filteredRoutes, sortBy);

  return (
    <Card 
      title="路线列表"
      extra={
        <Space wrap>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 120 }}
            size={mobile ? 'middle' : 'small'}
          >
            <Option value="updatedAt">最近更新</Option>
            <Option value="createdAt">创建时间</Option>
            <Option value="name">名称</Option>
            <Option value="favorite">收藏优先</Option>
          </Select>
          <Button
            icon={<FilterOutlined />}
            onClick={() => {
              setFilterFavorite(filterFavorite === null ? true : filterFavorite === true ? false : null);
            }}
            type={filterFavorite === true ? 'primary' : 'default'}
            size={mobile ? 'middle' : 'small'}
          >
            {filterFavorite === true ? '已收藏' : filterFavorite === false ? '未收藏' : '全部'}
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => {
              setFilterTemplate(filterTemplate === null ? true : filterTemplate === true ? false : null);
            }}
            type={filterTemplate === true ? 'primary' : 'default'}
            size={mobile ? 'middle' : 'small'}
          >
            {filterTemplate === true ? '模板' : filterTemplate === false ? '非模板' : '全部'}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
        <Search
          placeholder="搜索路线名称、地点、标签..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          size={mobile ? 'large' : 'middle'}
        />
      </Space>

      {filteredRoutes.length === 0 ? (
        <Empty description={routes.length === 0 ? "暂无路线" : "没有找到匹配的路线"} />
      ) : (
        <List
          dataSource={filteredRoutes}
          renderItem={(route) => (
            <List.Item
              style={{
                padding: mobile ? '12px' : '16px',
                border: '1px solid #f0f0f0',
                marginBottom: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: route.isFavorite ? '#fffbe6' : '#fff'
              }}
              onClick={() => onSelectRoute && onSelectRoute(route)}
              actions={[
                <Tooltip key="favorite" title={route.isFavorite ? '取消收藏' : '收藏'}>
                  <Button
                    type="text"
                    icon={route.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(route.id);
                    }}
                    size="small"
                  />
                </Tooltip>,
                <Tooltip key="template" title={route.isTemplate ? '取消模板' : '设为模板'}>
                  <Button
                    type="text"
                    icon={<FileTextOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetTemplate(route.id, !route.isTemplate);
                    }}
                    size="small"
                    style={{ color: route.isTemplate ? '#1890ff' : undefined }}
                  />
                </Tooltip>,
                <Tooltip key="share" title="分享">
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(route);
                    }}
                    size="small"
                  />
                </Tooltip>,
                <Tooltip key="duplicate" title="复制">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(route.id);
                    }}
                    size="small"
                  />
                </Tooltip>,
                <Tooltip key="edit" title="编辑">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRoute && onEditRoute(route);
                    }}
                    size="small"
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="确定要删除这条路线吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(route.id);
                  }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{route.name}</span>
                    {route.isFavorite && <Tag color="gold" icon={<StarFilled />}>收藏</Tag>}
                    {route.isTemplate && <Tag color="blue" icon={<FileTextOutlined />}>模板</Tag>}
                    {route.tags && route.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                      {route.waypoints.length} 个经过点
                      {route.description && ` · ${route.description}`}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                      更新于 {formatDateTime(route.updatedAt)}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};
