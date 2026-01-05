import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Spin, Radio, Space, Button, Tooltip, Empty } from 'antd';
import { 
  AppstoreOutlined, 
  UnorderedListOutlined, 
  ClockCircleOutlined,
  CopyOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { BatchQueryResult } from '../../types/weather';
import { formatDateTime } from '../../utils/format';
import { isMobile } from '../../utils/mobile';
import dayjs from 'dayjs';

type ViewMode = 'card' | 'list' | 'timeline';

interface EnhancedWeatherDisplayProps {
  data: BatchQueryResult[];
  loading?: boolean;
  onCopy?: (item: BatchQueryResult) => void;
  onShare?: (item: BatchQueryResult) => void;
  onFavorite?: (item: BatchQueryResult) => void;
  favorites?: string[]; // 收藏的地点列表
}

export const EnhancedWeatherDisplay: React.FC<EnhancedWeatherDisplayProps> = ({
  data,
  loading,
  onCopy,
  onShare,
  onFavorite,
  favorites = []
}) => {
  const [mobile, setMobile] = useState(isMobile());
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = (item: BatchQueryResult) => {
    const text = `${item.location} - ${formatDateTime(item.arrivalTime)}\n` +
      `温度: ${Math.round(item.weather.temperature)}°C\n` +
      `天气: ${item.weather.weatherCondition}\n` +
      `湿度: ${item.weather.humidity}%\n` +
      `风速: ${item.weather.windSpeed} m/s\n` +
      `降水: ${item.weather.precipitation}mm`;
    
    navigator.clipboard.writeText(text).then(() => {
      if (onCopy) onCopy(item);
    });
  };

  const handleShare = (item: BatchQueryResult) => {
    const shareText = `${item.location}的天气：${item.weather.weatherCondition}，${Math.round(item.weather.temperature)}°C`;
    if (navigator.share) {
      navigator.share({
        title: `${item.location}的天气`,
        text: shareText
      }).catch(() => {
        // 如果不支持分享API，复制到剪贴板
        navigator.clipboard.writeText(shareText);
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
    if (onShare) onShare(item);
  };

  const handleFavorite = (item: BatchQueryResult) => {
    if (onFavorite) onFavorite(item);
  };

  const isFavorite = (location: string) => {
    return favorites.includes(location);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: mobile ? '30px' : '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: mobile ? '30px' : '50px', color: '#999' }}>
        <Empty description="暂无天气数据" />
      </div>
    );
  }

  // 卡片视图
  const renderCardView = () => (
    <Row gutter={[mobile ? 12 : 16, mobile ? 12 : 16]}>
      {data.map((item, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <Card
            title={
              <Space>
                <span>{item.location}</span>
                {isFavorite(item.location) && (
                  <StarFilled style={{ color: '#faad14' }} />
                )}
              </Space>
            }
            extra={
              <Space>
                <Tag color="blue">{formatDateTime(item.arrivalTime)}</Tag>
                {onFavorite && (
                  <Button
                    type="text"
                    size="small"
                    icon={isFavorite(item.location) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={() => handleFavorite(item)}
                  />
                )}
              </Space>
            }
            hoverable={!mobile}
            style={{ height: '100%' }}
            actions={[
              onCopy && (
                <Tooltip key="copy" title="复制">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(item)}
                  />
                </Tooltip>
              ),
              onShare && (
                <Tooltip key="share" title="分享">
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    onClick={() => handleShare(item)}
                  />
                </Tooltip>
              )
            ].filter(Boolean) as React.ReactNode[]}
          >
            <div className="weather-info">
              <div style={{ textAlign: 'center', marginBottom: mobile ? 12 : 16 }}>
                <div style={{ 
                  fontSize: mobile ? 36 : 48, 
                  fontWeight: 'bold', 
                  color: '#1890ff' 
                }}>
                  {Math.round(item.weather.temperature)}°C
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: mobile ? 12 : 16 }}>
                <img
                  src={`https://cdn.heweather.com/cond_icon/${item.weather.icon}.png`}
                  alt={item.weather.weatherCondition}
                  style={{ width: mobile ? 48 : 64, height: mobile ? 48 : 64 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div style={{ fontSize: mobile ? 13 : 14, marginTop: 4 }}>
                  {item.weather.weatherCondition}
                </div>
              </div>
              <div style={{ fontSize: mobile ? 12 : 14, color: '#666' }}>
                <div style={{ marginBottom: 4 }}>湿度: {item.weather.humidity}%</div>
                <div style={{ marginBottom: 4 }}>风速: {item.weather.windSpeed} m/s</div>
                <div style={{ marginBottom: 4 }}>降水: {item.weather.precipitation}mm</div>
                {item.weather.feelsLike && (
                  <div>体感: {Math.round(item.weather.feelsLike)}°C</div>
                )}
                {item.weather.pressure && (
                  <div style={{ marginTop: 4 }}>气压: {item.weather.pressure} hPa</div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // 列表视图
  const renderListView = () => (
    <div>
      {data.map((item, index) => (
        <Card
          key={index}
          style={{ marginBottom: 16 }}
          title={
            <Space>
              <span>{item.location}</span>
              {isFavorite(item.location) && (
                <StarFilled style={{ color: '#faad14' }} />
              )}
              <Tag color="blue">{formatDateTime(item.arrivalTime)}</Tag>
            </Space>
          }
          extra={
            <Space>
              {onFavorite && (
                <Button
                  type="text"
                  size="small"
                  icon={isFavorite(item.location) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => handleFavorite(item)}
                />
              )}
              {onCopy && (
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(item)}
                />
              )}
              {onShare && (
                <Button
                  type="text"
                  size="small"
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShare(item)}
                />
              )}
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#1890ff' }}>
                  {Math.round(item.weather.temperature)}°C
                </div>
                <div style={{ marginTop: 8 }}>
                  <img
                    src={`https://cdn.heweather.com/cond_icon/${item.weather.icon}.png`}
                    alt={item.weather.weatherCondition}
                    style={{ width: 64, height: 64 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>{item.weather.weatherCondition}</div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={16}>
              <Row gutter={[16, 8]}>
                <Col xs={12} sm={8}>
                  <div style={{ color: '#999' }}>湿度</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{item.weather.humidity}%</div>
                </Col>
                <Col xs={12} sm={8}>
                  <div style={{ color: '#999' }}>风速</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{item.weather.windSpeed} m/s</div>
                </Col>
                <Col xs={12} sm={8}>
                  <div style={{ color: '#999' }}>降水</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{item.weather.precipitation}mm</div>
                </Col>
                {item.weather.feelsLike && (
                  <Col xs={12} sm={8}>
                    <div style={{ color: '#999' }}>体感温度</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{Math.round(item.weather.feelsLike)}°C</div>
                  </Col>
                )}
                {item.weather.pressure && (
                  <Col xs={12} sm={8}>
                    <div style={{ color: '#999' }}>气压</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{item.weather.pressure} hPa</div>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );

  // 时间轴视图
  const renderTimelineView = () => {
    // 按时间排序
    const sortedData = [...data].sort((a, b) => 
      dayjs(a.arrivalTime).valueOf() - dayjs(b.arrivalTime).valueOf()
    );

    return (
      <div style={{ position: 'relative', paddingLeft: mobile ? 20 : 40 }}>
        {sortedData.map((item, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              paddingBottom: 24,
              paddingLeft: mobile ? 30 : 50
            }}
          >
            {/* 时间轴线条 */}
            {index < sortedData.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: mobile ? 10 : 20,
                  top: 60,
                  bottom: -24,
                  width: 2,
                  background: '#e8e8e8'
                }}
              />
            )}
            
            {/* 时间轴节点 */}
            <div
              style={{
                position: 'absolute',
                left: mobile ? 0 : 10,
                top: 0,
                width: mobile ? 20 : 20,
                height: 20,
                borderRadius: '50%',
                background: '#1890ff',
                border: '3px solid #fff',
                boxShadow: '0 0 0 2px #1890ff'
              }}
            />

            <Card
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <span>{item.location}</span>
                  {isFavorite(item.location) && (
                    <StarFilled style={{ color: '#faad14' }} />
                  )}
                </Space>
              }
              extra={
                <Space>
                  <Tag color="blue" icon={<ClockCircleOutlined />}>
                    {formatDateTime(item.arrivalTime)}
                  </Tag>
                  {onFavorite && (
                    <Button
                      type="text"
                      size="small"
                      icon={isFavorite(item.location) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => handleFavorite(item)}
                    />
                  )}
                </Space>
              }
            >
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 'bold', color: '#1890ff' }}>
                      {Math.round(item.weather.temperature)}°C
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={`https://cdn.heweather.com/cond_icon/${item.weather.icon}.png`}
                        alt={item.weather.weatherCondition}
                        style={{ width: 48, height: 48 }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>{item.weather.weatherCondition}</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={16}>
                  <Space wrap>
                    <Tag>湿度: {item.weather.humidity}%</Tag>
                    <Tag>风速: {item.weather.windSpeed} m/s</Tag>
                    <Tag>降水: {item.weather.precipitation}mm</Tag>
                    {item.weather.feelsLike && (
                      <Tag>体感: {Math.round(item.weather.feelsLike)}°C</Tag>
                    )}
                    {item.weather.pressure && (
                      <Tag>气压: {item.weather.pressure} hPa</Tag>
                    )}
                  </Space>
                  {(onCopy || onShare) && (
                    <div style={{ marginTop: 12 }}>
                      <Space>
                        {onCopy && (
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopy(item)}
                          >
                            复制
                          </Button>
                        )}
                        {onShare && (
                          <Button
                            size="small"
                            icon={<ShareAltOutlined />}
                            onClick={() => handleShare(item)}
                          >
                            分享
                          </Button>
                        )}
                      </Space>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* 视图模式切换 */}
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          buttonStyle="solid"
          size={mobile ? 'small' : 'middle'}
        >
          <Radio.Button value="card">
            <AppstoreOutlined /> {!mobile && '卡片'}
          </Radio.Button>
          <Radio.Button value="list">
            <UnorderedListOutlined /> {!mobile && '列表'}
          </Radio.Button>
          <Radio.Button value="timeline">
            <ClockCircleOutlined /> {!mobile && '时间轴'}
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* 根据视图模式渲染 */}
      {viewMode === 'card' && renderCardView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'timeline' && renderTimelineView()}
    </div>
  );
};
