import React, { useState, useEffect } from 'react';
import { Input, Button, DatePicker, Space, message, AutoComplete, Tag, Popover, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, StarOutlined, EnvironmentOutlined, ClockCircleOutlined, ImportOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Dayjs } from 'dayjs';
import { isMobile } from '../../utils/mobile';
import { getPopularLocations, getQueryHistory } from '../../utils/historyCache';
import { getCurrentLocation, reverseGeocode } from '../../utils/locationUtils';
import dayjs from 'dayjs';

export interface WaypointInput {
  location: string;
  dateTime: Dayjs | null; // 合并日期和时间
}

interface RouteInputProps {
  onQuery: (waypoints: Array<{ location: string; arrivalTime: string }>) => void;
  loading?: boolean;
}

export const RouteInput: React.FC<RouteInputProps> = ({ onQuery, loading }) => {
  const { t } = useTranslation(['common', 'home']);
  
  // 默认时间为今天中午12点
  const getDefaultDateTime = () => {
    return dayjs().hour(12).minute(0).second(0).millisecond(0);
  };

  const [waypoints, setWaypoints] = useState<WaypointInput[]>([
    { location: '', dateTime: getDefaultDateTime() }
  ]);
  const [mobile, setMobile] = useState(isMobile());
  const [popularLocations, setPopularLocations] = useState<Array<{ value: string; label: React.ReactNode }>>([]);
  const [locationOptions, setLocationOptions] = useState<Array<{ value: string; label: React.ReactNode }>>([]);
  const [locating, setLocating] = useState<number | null>(null); // 正在定位的索引

  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 加载常用地点和历史记录
    const locations = getPopularLocations();
    const history = getQueryHistory();
    
    // 合并常用地点和历史记录中的地点
    const locationSet = new Set<string>();
    const locationMap = new Map<string, number>();
    
    // 添加常用地点
    locations.forEach(loc => {
      locationSet.add(loc.location);
      locationMap.set(loc.location, loc.queryCount);
    });
    
    // 添加历史记录中的地点
    history.forEach(h => {
      h.waypoints.forEach(wp => {
        if (wp.location) {
          locationSet.add(wp.location);
          const count = locationMap.get(wp.location) || 0;
          locationMap.set(wp.location, count + 1);
        }
      });
    });
    
    // 转换为选项
    const options = Array.from(locationSet)
      .map(loc => ({
        value: loc,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{loc}</span>
            {locationMap.get(loc) && locationMap.get(loc)! > 1 && (
              <Tag icon={<StarOutlined />} color="gold" style={{ margin: 0 }}>
                {locationMap.get(loc)}次
              </Tag>
            )}
          </div>
        )
      }))
      .sort((a, b) => {
        const countA = locationMap.get(a.value) || 0;
        const countB = locationMap.get(b.value) || 0;
        return countB - countA;
      })
      .slice(0, 20);
    
    setPopularLocations(options);
    setLocationOptions(options);
  }, []);

  // 处理地点输入变化，动态更新选项
  const handleLocationSearch = (value: string, index: number) => {
    updateWaypoint(index, 'location', value);
    
    if (!value.trim()) {
      setLocationOptions(popularLocations);
      return;
    }
    
    // 过滤选项
    const filtered = popularLocations.filter(opt => 
      opt.value.toLowerCase().includes(value.toLowerCase())
    );
    
    // 如果没有匹配项，添加当前输入作为选项
    if (filtered.length === 0 && value.trim()) {
      setLocationOptions([{
        value: value.trim(),
        label: <span>{value.trim()}</span>
      }]);
    } else {
      setLocationOptions(filtered);
    }
  };

  // GPS定位
  const handleGetLocation = async (index: number) => {
    setLocating(index);
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.latitude, location.longitude);
      updateWaypoint(index, 'location', address);
      message.success(t('common:success'));
    } catch (error: any) {
      message.error(error.message || t('common:error'));
    } finally {
      setLocating(null);
    }
  };

  // 快速时间选择
  const handleQuickTime = (index: number, hours: number) => {
    const now = dayjs();
    const targetTime = now.add(hours, 'hour');
    updateWaypoint(index, 'dateTime', targetTime);
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, { location: '', dateTime: getDefaultDateTime() }]);
  };

  const removeWaypoint = (index: number) => {
    if (waypoints.length > 1) {
      setWaypoints(waypoints.filter((_, i) => i !== index));
    }
  };

  const updateWaypoint = (index: number, field: keyof WaypointInput, value: any) => {
    const updated = [...waypoints];
    updated[index][field] = value;
    setWaypoints(updated);
  };

  const handleQuery = () => {
    // 验证输入
    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      if (!wp.location.trim()) {
        message.error(t('home:locationRequired', { index: i + 1 }));
        return;
      }
      if (!wp.dateTime) {
        message.error(t('home:timeRequired', { index: i + 1 }));
        return;
      }
    }

    // 转换为API需要的格式
    const formattedWaypoints = waypoints.map(wp => ({
      location: wp.location.trim(),
      arrivalTime: wp.dateTime!.toISOString()
    }));

    onQuery(formattedWaypoints);
  };

  // 批量导入（从文本）
  const handleBatchImport = () => {
    const text = prompt('请输入地点和时间，每行一个，格式：地点,日期时间\n例如：北京,2024-01-01 10:00\n或者：地点,日期,时间\n例如：北京,2024-01-01,10:00');
    if (!text) return;

    try {
      const lines = text.split('\n').filter(line => line.trim());
      const imported: WaypointInput[] = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 2) {
          throw new Error(`格式错误: ${line}`);
        }
        
        const [location, ...timeParts] = parts;
        let dateTime: Dayjs;
        
        if (timeParts.length === 1) {
          // 格式：地点,日期时间
          dateTime = dayjs(timeParts[0]);
        } else if (timeParts.length >= 2) {
          // 格式：地点,日期,时间
          const dateStr = timeParts[0];
          const timeStr = timeParts[1];
          dateTime = dayjs(`${dateStr} ${timeStr}`);
        } else {
          throw new Error(`格式错误: ${line}`);
        }
        
        if (!dateTime.isValid()) {
          throw new Error(`日期时间格式错误: ${line}`);
        }
        
        return {
          location,
          dateTime
        };
      });

      if (imported.length > 0) {
        setWaypoints(imported);
        message.success(t('common:success'));
      }
    } catch (error: any) {
      message.error(error.message || t('common:error'));
    }
  };

  // 批量复制
  const handleBatchCopy = () => {
    const text = waypoints.map((wp, index) => {
      const dateTimeStr = wp.dateTime ? wp.dateTime.format('YYYY-MM-DD HH:mm') : '';
      return `${index + 1}. ${wp.location || '(未填写)'}, ${dateTimeStr}`;
    }).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      message.success(t('common:success'));
    });
  };

  return (
    <div className="route-input">
      {waypoints.map((waypoint, index) => (
        <div key={index} style={{ marginBottom: 16, width: '100%' }}>
          {mobile ? (
            // 移动端：垂直布局
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Space.Compact style={{ width: '100%' }}>
                <AutoComplete
                  placeholder={t('home:locationPlaceholder')}
                  value={waypoint.location}
                  onChange={(value) => handleLocationSearch(value, index)}
                  onSearch={(value) => handleLocationSearch(value, index)}
                  options={locationOptions}
                  size="large"
                  style={{ flex: 1 }}
                />
                <Tooltip title={t('home:gpsLocation')}>
                  <Button
                    icon={<EnvironmentOutlined />}
                    loading={locating === index}
                    onClick={() => handleGetLocation(index)}
                    size="large"
                  />
                </Tooltip>
              </Space.Compact>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <DatePicker
                  showTime
                  placeholder={t('home:datetimePlaceholder')}
                  value={waypoint.dateTime}
                  onChange={(dateTime) => updateWaypoint(index, 'dateTime', dateTime)}
                  format="YYYY-MM-DD HH:mm"
                  style={{ flex: 1 }}
                  size="large"
                  defaultValue={getDefaultDateTime()}
                />
                {/* 快速时间选择 */}
                <Popover
                  content={
                    <Space direction="vertical" size="small">
                      <Button size="small" onClick={() => handleQuickTime(index, 0)}>{t('home:now')}</Button>
                      <Button size="small" onClick={() => handleQuickTime(index, 1)}>{t('home:hoursLater', { count: 1 })}</Button>
                      <Button size="small" onClick={() => handleQuickTime(index, 2)}>{t('home:hoursLater', { count: 2 })}</Button>
                      <Button size="small" onClick={() => handleQuickTime(index, 6)}>{t('home:hoursLater', { count: 6 })}</Button>
                      <Button size="small" onClick={() => handleQuickTime(index, 12)}>{t('home:hoursLater', { count: 12 })}</Button>
                      <Button size="small" onClick={() => handleQuickTime(index, 24)}>{t('home:hoursLater', { count: 24 })}</Button>
                    </Space>
                  }
                  title={t('home:quickTime')}
                  trigger="click"
                >
                  <Button
                    icon={<ClockCircleOutlined />}
                    size="large"
                  >
                    {t('home:quickTime')}
                  </Button>
                </Popover>
              </div>
              {waypoints.length > 1 && (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => removeWaypoint(index)}
                  danger
                  block
                  size="large"
                >
                  {t('home:deleteWaypoint')}
                </Button>
              )}
            </div>
          ) : (
            // 桌面端：水平布局
            <Space style={{ width: '100%' }} wrap>
              <Space.Compact>
                <AutoComplete
                  placeholder={t('home:locationPlaceholder')}
                  value={waypoint.location}
                  onChange={(value) => handleLocationSearch(value, index)}
                  onSearch={(value) => handleLocationSearch(value, index)}
                  options={locationOptions}
                  style={{ width: 200 }}
                />
                <Tooltip title={t('home:gpsLocation')}>
                  <Button
                    icon={<EnvironmentOutlined />}
                    loading={locating === index}
                    onClick={() => handleGetLocation(index)}
                  />
                </Tooltip>
              </Space.Compact>
              <DatePicker
                showTime
                placeholder={t('home:datetimePlaceholder')}
                value={waypoint.dateTime}
                onChange={(dateTime) => updateWaypoint(index, 'dateTime', dateTime)}
                format="YYYY-MM-DD HH:mm"
                defaultValue={getDefaultDateTime()}
              />
              {/* 快速时间选择 */}
              <Popover
                content={
                  <Space direction="vertical" size="small">
                    <Button size="small" onClick={() => handleQuickTime(index, 0)}>{t('home:now')}</Button>
                    <Button size="small" onClick={() => handleQuickTime(index, 1)}>{t('home:hoursLater', { count: 1 })}</Button>
                    <Button size="small" onClick={() => handleQuickTime(index, 2)}>{t('home:hoursLater', { count: 2 })}</Button>
                    <Button size="small" onClick={() => handleQuickTime(index, 6)}>{t('home:hoursLater', { count: 6 })}</Button>
                    <Button size="small" onClick={() => handleQuickTime(index, 12)}>{t('home:hoursLater', { count: 12 })}</Button>
                    <Button size="small" onClick={() => handleQuickTime(index, 24)}>{t('home:hoursLater', { count: 24 })}</Button>
                  </Space>
                }
                title={t('home:quickTime')}
                trigger="click"
              >
                <Button icon={<ClockCircleOutlined />}>{t('home:quickTime')}</Button>
              </Popover>
              {waypoints.length > 1 && (
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => removeWaypoint(index)}
                  danger
                />
              )}
            </Space>
          )}
        </div>
      ))}
      <Space direction={mobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }} size="middle" wrap>
        <Button
          icon={<PlusOutlined />}
          onClick={addWaypoint}
          type="dashed"
          block={mobile}
          size={mobile ? 'large' : 'middle'}
        >
          {t('home:addWaypoint')}
        </Button>
        <Button
          icon={<ImportOutlined />}
          onClick={handleBatchImport}
          block={mobile}
          size={mobile ? 'large' : 'middle'}
        >
          {t('home:batchImport')}
        </Button>
        {waypoints.length > 0 && (
          <Button
            icon={<CopyOutlined />}
            onClick={handleBatchCopy}
            block={mobile}
            size={mobile ? 'large' : 'middle'}
          >
            {t('home:copyList')}
          </Button>
        )}
        <Button
          type="primary"
          onClick={handleQuery}
          loading={loading}
          block={mobile}
          size={mobile ? 'large' : 'middle'}
        >
          {t('home:queryWeather')}
        </Button>
      </Space>
    </div>
  );
};
