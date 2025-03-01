import React, { useState } from 'react';
import { Timeline, Card, Image, Select, Empty, Spin, Typography, DatePicker, Space } from 'antd';
import { TrophyOutlined, CalendarOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';
import { Child, Reward } from '../types';
import dayjs from 'dayjs';

interface RewardsDisplayProps {
  children: Child[];
  rewards: Reward[];
  loading: boolean;
}

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RewardsDisplay: React.FC<RewardsDisplayProps> = ({ children, rewards, loading }) => {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 18]);
  
  // 根据选择的孩子和日期范围筛选奖项
  const filteredRewards = rewards.filter(reward => {
    // 筛选孩子
    if (selectedChild !== 'all' && reward.childId !== selectedChild) {
      return false;
    }
    
    // 筛选日期范围
    if (dateRange[0] && dateRange[1]) {
      const rewardDate = dayjs(reward.date);
      if (!rewardDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) {
        return false;
      }
    }
    
    // 筛选年龄范围
    const child = children.find(c => c.id === reward.childId);
    if (child) {
      const age = dayjs(reward.date).diff(dayjs(child.birthDate), 'year');
      if (age < ageRange[0] || age > ageRange[1]) {
        return false;
      }
    }
    
    return true;
  });
  
  // 按日期排序奖项（从新到旧）
  const sortedRewards = [...filteredRewards].sort((a, b) => {
    return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
  });
  
  // 获取孩子名称
  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? child.name : '未知';
  };
  
  // 获取孩子头像
  const getChildAvatar = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child?.avatar;
  };

  if (loading) {
    return <Spin size="large" tip="加载中..." style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Title level={4}>奖状展示墙</Title>
        <Space size="middle">
          <Select
            style={{ width: 200 }}
            placeholder="选择孩子"
            value={selectedChild}
            onChange={value => setSelectedChild(value)}
            options={[
              { value: 'all', label: '所有孩子' },
              ...children.map(child => ({
                value: child.id,
                label: child.name
              }))
            ]}
          />
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            placeholder={['开始日期', '结束日期']}
          />
          <Select
            style={{ width: 200 }}
            placeholder="年龄范围"
            value={`${ageRange[0]}-${ageRange[1]}岁`}
            onChange={(value) => {
              const [min, max] = value.split('-').map(v => parseInt(v));
              setAgeRange([min, max]);
            }}
            options={[
              { value: '0-6', label: '0-6岁' },
              { value: '7-12', label: '7-12岁' },
              { value: '13-15', label: '13-15岁' },
              { value: '16-18', label: '16-18岁' },
              { value: '0-18', label: '所有年龄' },
            ]}
          />
        </Space>
      </div>
      
      {sortedRewards.length > 0 ? (
        <Timeline
          mode="left"
          items={sortedRewards.map(reward => ({
            label: reward.date,
            dot: <TrophyOutlined style={{ fontSize: '16px', color: '#1890ff' }} />,
            children: (
              <Card 
                hoverable 
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getChildAvatar(reward.childId) ? (
                      <img 
                        src={getChildAvatar(reward.childId)} 
                        alt="头像" 
                        style={{ width: 40, height: 40, borderRadius: '50%' }} 
                      />
                    ) : (
                      <UserOutlined style={{ fontSize: 24, padding: 8, background: '#f0f0f0', borderRadius: '50%' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>{getChildName(reward.childId)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: 14 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} /> {reward.date}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <ProjectOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      <Text strong>{reward.activity}</Text>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginBottom: 12 }}>
                      {reward.name}
                    </div>
                  </div>
                  
                  {reward.image && (
                    <Image
                      src={`file://${reward.image}`}
                      alt={reward.name}
                      style={{ maxHeight: 300, objectFit: 'contain' }}
                      className="image-preview"
                    />
                  )}
                </div>
              </Card>
            )
          }))}
        />
      ) : (
        <Empty description="暂无奖项记录" style={{ marginTop: 60 }} />
      )}
    </div>
  );
};

export default RewardsDisplay;