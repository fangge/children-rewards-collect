import React, { useState } from 'react';
import {
  Timeline,
  Card,
  Image,
  Select,
  Empty,
  Spin,
  Typography,
  DatePicker,
  Space
} from 'antd';
import {
  TrophyOutlined,
  CalendarOutlined,
  UserOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { Child, Reward } from '../types';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
interface RewardsDisplayProps {
  children: Child[];
  rewards: Reward[];
  loading: boolean;
}
// 在组件顶部定义类型
type DateRangeType = [Dayjs | null, Dayjs | null] | null;

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RewardsDisplay: React.FC<RewardsDisplayProps> = ({
  children,
  rewards,
  loading
}) => {
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangeType>(null);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 18]);

  // 根据选择的孩子和日期范围筛选奖项
  const filteredRewards = rewards.filter((reward) => {
    try {
      // 1. 筛选孩子
      if (selectedChild !== 'all' && reward.childId !== selectedChild) {
        return false;
      }

      // 2. 日期范围筛选（带类型校验）
      if (dateRange) {
        const [start, end] = dateRange;
        // 验证日期有效性
        if (!start?.isValid() || !end?.isValid()) return true;

        const rewardDate = dayjs(reward.date);
        if (!rewardDate.isValid()) return false;

        // 使用安全比较模式
        const isInRange = rewardDate.isBetween(
          start.startOf('day'),
          end.endOf('day'),
          'day',
          '[]'
        );
        if (!isInRange) return false;
      }

      // 3. 年龄计算（带错误处理）
      const child = children.find((c) => c.id === reward.childId);
      if (!child) {
        console.warn(`找不到对应孩子：${reward.childId}`);
        return false;
      }

      const birthDate = dayjs(child.birthDate);
      const rewardDate = dayjs(reward.date);
      if (!birthDate.isValid() || !rewardDate.isValid()) {
        console.error('无效的日期格式');
        return false;
      }

      // 精确年龄计算（考虑月份）
      const preciseAge = rewardDate.diff(birthDate, 'year', true);
      const flooredAge = Math.floor(preciseAge);
      if (flooredAge < ageRange[0] || flooredAge > ageRange[1]) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('过滤奖励时发生错误:', error);
      return false;
    }
  });

  // 按日期排序奖项（从新到旧）
  const sortedRewards = [...filteredRewards].sort((a, b) => {
    return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
  });

  // 获取孩子名称
  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child ? child.name : '未知';
  };

  // 获取孩子头像
  const getChildAvatar = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child?.avatar;
  };
  // 安全的处理函数
  const handleDateChange = (dates: DateRangeType) => {
    if (dates && dates[0]?.isValid() && dates[1]?.isValid()) {
      // 明确转换为包含两个Dayjs的元组
      setDateRange([dates[0], dates[1]]);
    } else {
      // 处理清空选择的情况
      setDateRange(null);
    }
  };

  if (loading) {
    return (
      <Spin
        size="large"
        tip="加载中..."
        style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}
      />
    );
  }

  return (
    <div>
      <nav
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <Title level={4}>奖状展示墙</Title>
        <Space size="middle">
          <Select
            style={{ width: 200 }}
            placeholder="选择孩子"
            value={selectedChild}
            onChange={(value) => setSelectedChild(value)}
            options={[
              { value: 'all', label: '所有孩子' },
              ...children.map((child) => ({
                value: child.id,
                label: child.name
              }))
            ]}
          />
          <RangePicker
            onChange={handleDateChange}
            placeholder={['开始日期', '结束日期']}
          />
          <Select
            style={{ width: 200 }}
            placeholder="年龄范围"
            value={`${ageRange[0]}-${ageRange[1]}岁`}
            onChange={(value) => {
              const [min, max] = value.split('-').map((v) => parseInt(v));
              setAgeRange([min, max]);
            }}
            options={[
              { value: '0-6', label: '0-6岁' },
              { value: '7-12', label: '7-12岁' },
              { value: '13-15', label: '13-15岁' },
              { value: '16-18', label: '16-18岁' },
              { value: '0-18', label: '所有年龄' }
            ]}
          />
        </Space>
      </nav>
      <section className="cont">
        {sortedRewards.length > 0 ? (
          <Timeline
            mode="alternate"
            items={sortedRewards.map((reward) => ({
              label: reward.date,
              dot: (
                <TrophyOutlined
                  style={{ fontSize: '16px', color: '#1890ff' }}
                />
              ),
              children: (
                <Card hoverable style={{ marginBottom: 16, padding: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      {getChildAvatar(reward.childId) ? (
                        <img
                          src={getChildAvatar(reward.childId)}
                          alt="头像"
                          style={{ width: 40, height: 40, borderRadius: '50%' }}
                        />
                      ) : (
                        <UserOutlined
                          style={{
                            fontSize: 24,
                            padding: 8,
                            background: '#f0f0f0',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {getChildName(reward.childId)}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#888',
                            fontSize: 14
                          }}
                        >
                          <CalendarOutlined style={{ marginRight: 4 }} />{' '}
                          {reward.date}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 8
                        }}
                      >
                        <ProjectOutlined
                          style={{ marginRight: 8, color: '#1890ff' }}
                        />
                        <Text strong>{reward.activity}</Text>
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: '#1890ff',
                          marginBottom: 12
                        }}
                      >
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
      </section>
    </div>
  );
};

export default RewardsDisplay;
