import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Button, Space, Popconfirm, message } from 'antd';
import { ReloadOutlined, ClearOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { QueryStatistics } from '../../types/history';
import { getQueryStatistics, resetQueryStatistics } from '../../utils/historyCache';
import { formatDateTime } from '../../utils/format';

export const StatisticsPanel: React.FC = () => {
  const [stats, setStats] = useState<QueryStatistics>({
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageQueryDuration: 0,
    lastQueryTime: null,
    firstQueryTime: null
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const statistics = getQueryStatistics();
    setStats(statistics);
  };

  const handleReset = () => {
    resetQueryStatistics();
    loadStatistics();
    message.success('统计数据已重置');
  };

  const successRate = stats.totalQueries > 0 
    ? ((stats.successfulQueries / stats.totalQueries) * 100).toFixed(1)
    : '0.0';

  return (
    <Card 
      title="查询统计"
      extra={
        <Space>
          <Button 
            type="link" 
            onClick={loadStatistics}
            icon={<ReloadOutlined />}
          >
            刷新
          </Button>
          <Popconfirm
            title="确定要重置统计数据吗？此操作不可恢复！"
            onConfirm={handleReset}
          >
            <Button 
              type="link" 
              danger
              icon={<ClearOutlined />}
            >
              重置
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="总查询次数"
            value={stats.totalQueries}
            prefix={<ReloadOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="成功查询"
            value={stats.successfulQueries}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="失败查询"
            value={stats.failedQueries}
            valueStyle={{ color: '#cf1322' }}
            prefix={<CloseCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="成功率"
            value={successRate}
            suffix="%"
            precision={1}
            valueStyle={{ 
              color: parseFloat(successRate) >= 90 ? '#3f8600' : 
                     parseFloat(successRate) >= 70 ? '#faad14' : '#cf1322' 
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="平均查询耗时"
            value={Math.round(stats.averageQueryDuration)}
            suffix="ms"
            precision={0}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="最后查询时间"
            value={stats.lastQueryTime ? formatDateTime(stats.lastQueryTime) : '暂无'}
          />
        </Col>
        {stats.firstQueryTime && (
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="首次查询时间"
              value={formatDateTime(stats.firstQueryTime)}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};
