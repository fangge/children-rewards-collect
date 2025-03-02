import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Child, Reward } from '../types';
import dayjs from 'dayjs';

import { v4 as uuidv4 } from 'uuid';

interface RewardsManagementProps {
  children: Child[];
  rewards: Reward[];
  onSave: (rewards: Reward[]) => void;
}

const RewardsManagement: React.FC<RewardsManagementProps> = ({
  children,
  rewards,
  onSave
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 打开添加/编辑模态框

  const handleSelectImage = async () => {
    try {
      message.loading('正在选择图片...', 0.5);
      const result = await window.electronAPI.selectImage();

      if (result.error) {
        message.error(`图片选择失败: ${result.error}`);
        return;
      }

      if (!result.canceled && result.filePath) {
        setImageUrl(`file://${result.filePath}`);
        setFileName(result.fileName || '');
        message.success('图片选择成功');
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      message.error(
        `选择图片失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  };

  const showModal = (reward?: Reward) => {
    setEditingReward(reward || null);
    setImageUrl(reward?.image || '');
    setFileName(reward?.fileName || '');
    form.resetFields();

    if (reward) {
      form.setFieldsValue({
        childId: reward.childId,
        date: reward.date ? dayjs(reward.date) : undefined,
        activity: reward.activity,
        name: reward.name
      });
    }

    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 如果有新上传的图片，保存图片
      let finalImageUrl = imageUrl;
      let finalFileName = fileName;

      if (imageUrl && imageUrl.startsWith('data:')) {
        // 这是一个新上传的base64图片，需要保存
        const saveResult = await window.electronAPI.saveImage(
          imageUrl,
          fileName
        );
        if (saveResult.success) {
          finalImageUrl = saveResult.path;
        } else {
          message.error('保存图片失败');
          return;
        }
      }

      const updatedReward: Reward = {
        id: editingReward?.id || uuidv4(),
        childId: values.childId,
        date: values.date.format('YYYY-MM-DD'),
        activity: values.activity,
        name: values.name,
        image: finalImageUrl,
        fileName: finalFileName
      };

      let updatedRewards: Reward[];

      if (editingReward) {
        // 编辑现有奖项
        updatedRewards = rewards.map((reward) =>
          reward.id === editingReward.id ? updatedReward : reward
        );
      } else {
        // 添加新奖项
        updatedRewards = [...rewards, updatedReward];
      }

      await onSave(updatedRewards);
      setIsModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理删除奖项
  const handleDelete = async (rewardId: string) => {
    const updatedRewards = rewards.filter((reward) => reward.id !== rewardId);
    await onSave(updatedRewards);
    message.success('删除成功');
  };

  // 预览图片
  const handlePreview = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  // 获取孩子名称
  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child ? child.name : '未知';
  };

  // 表格列定义
  const columns = [
    {
      title: '奖项图片',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) =>
        image ? (
          <img
            src={image}
            alt="奖项图片"
            style={{ width: 80, height: 80, cursor: 'pointer' }}
            onClick={() => handlePreview(image)}
          />
        ) : (
          '无图片'
        )
    },
    {
      title: '孩子',
      dataIndex: 'childId',
      key: 'childId',
      render: (childId: string) => getChildName(childId)
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '活动',
      dataIndex: 'activity',
      key: 'activity'
    },
    {
      title: '奖项名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Reward) => (
        <>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个奖项吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加奖项
        </Button>
      </div>

      <Table
        dataSource={rewards}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingReward ? '编辑奖项信息' : '添加奖项'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="childId"
            label="选择孩子"
            rules={[{ required: true, message: '请选择孩子' }]}
          >
            <Select placeholder="请选择孩子">
              {children.map((child) => (
                <Select.Option key={child.id} value={child.id}>
                  {child.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="获奖日期"
            rules={[{ required: true, message: '请选择获奖日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="activity"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>

          <Form.Item
            name="name"
            label="奖项名称"
            rules={[{ required: true, message: '请输入奖项名称' }]}
          >
            <Input placeholder="请输入奖项名称" />
          </Form.Item>

          <Form.Item label="奖项图片">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="奖项图片预览"
                  style={{
                    width: 120,
                    height: 120,
                    marginRight: 16,
                    objectFit: 'contain'
                  }}
                />
              )}
              <Button icon={<UploadOutlined />} onClick={handleSelectImage}>
                选择图片
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default RewardsManagement;
