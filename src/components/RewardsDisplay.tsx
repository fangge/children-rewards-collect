import React, { useState } from 'react';
import { Timeline, Card, Image, Select, Empty, Spin, Typography } from 'antd';
import { TrophyOutlined, CalendarOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';
import { Child, Reward } from '../types';
import dayjs from 'dayjs';

interface RewardsDisplayProps {
  children: Child[];
  rewards: Reward[];
  loading: boolean;
}

const { Title, Text } = Typography;

const RewardsDisplay: React.FC<RewardsDisplayProps> = ({ children, rewards, loading }) => {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  
  // 根据选择的孩子筛选奖项
  const filteredRewards = selectedChild === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.childId === selectedChild);
  
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>奖状展示墙</Title>
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
                      src={reward.image}
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