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
  Popconfirm,
  Space
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  BookOutlined
} from '@ant-design/icons';
import { Child, Reward, Subject } from '../types';
import dayjs from 'dayjs';

import { v4 as uuidv4 } from 'uuid';

interface RewardsManagementProps {
  children: Child[];
  rewards: Reward[];
  subjects: Subject[];
  onSave: (rewards: Reward[]) => void;
  onSaveSubjects: (subjects: Subject[]) => void;
}

const RewardsManagement: React.FC<RewardsManagementProps> = ({
  children,
  rewards,
  subjects,
  onSave,
  onSaveSubjects
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  // 学科管理相关状态
  const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
  const [subjectForm] = Form.useForm();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // 不再需要初始化默认学科数据，因为现在从App组件接收subjects

  // 打开学科管理模态框
  const showSubjectModal = (subject?: Subject) => {
    setEditingSubject(subject || null);
    subjectForm.resetFields();
    
    if (subject) {
      subjectForm.setFieldsValue({
        name: subject.name
      });
    }
    
    setIsSubjectModalVisible(true);
  };

  // 处理学科模态框确认
  const handleSubjectOk = async () => {
    try {
      const values = await subjectForm.validateFields();
      
      const updatedSubject: Subject = {
        id: editingSubject?.id || uuidv4(),
        name: values.name
      };
      
      let updatedSubjects: Subject[];
      
      if (editingSubject) {
        // 编辑现有学科
        updatedSubjects = subjects.map(subject => 
          subject.id === editingSubject.id ? updatedSubject : subject
        );
      } else {
        // 添加新学科
        updatedSubjects = [...subjects, updatedSubject];
      }
      
      onSaveSubjects(updatedSubjects);
      setIsSubjectModalVisible(false);
      message.success(editingSubject ? '学科更新成功' : '学科添加成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理删除学科
  const handleDeleteSubject = (subjectId: string) => {
    // 检查是否有奖项使用了该学科
    const isUsed = rewards.some(reward => reward.subjectId === subjectId);
    
    if (isUsed) {
      message.error('该学科已被奖项使用，无法删除');
      return;
    }
    
    const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
    onSaveSubjects(updatedSubjects);
    message.success('学科删除成功');
  };

  // 打开添加/编辑奖项模态框
  const handleSelectImage = async () => {
    try {
      message.loading('正在选择图片...', 0.5);
      const result = await window.electronAPI.selectImage();

      if (result.error) {
        message.error(`图片选择失败: ${result.error}`);
        return;
      }

      if (!result.canceled && result.imageData) {
        setImageUrl(result.imageData);
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
        name: reward.name,
        subjectId: reward.subjectId
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
      const finalFileName = fileName;

      if (imageUrl && imageUrl.startsWith('data:')) {
        // 这是一个新上传的base64图片，需要保存
        const date = values.date.format('YYYY-MM-DD');
        const [year, month, day] = date.split('-');
        const saveResult = await window.electronAPI.saveImage({
          imageData: imageUrl,
          fileName: fileName,
          date,
          subDir: `${year}/${month}/${day}`  // 添加子目录结构
        });
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
        fileName: finalFileName,
        subjectId: values.subjectId
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
  
  // 获取学科名称
  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return '未分类';
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : '未知';
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
      title: '学科',
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (subjectId?: string) => getSubjectName(subjectId)
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
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            添加奖项
          </Button>
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => showSubjectModal()}
          >
            管理学科
          </Button>
        </Space>
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
          
          <Form.Item
            name="subjectId"
            label="所属学科"
          >
            <Select placeholder="请选择所属学科">
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
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
      
      {/* 学科管理模态框 */}
      <Modal
        title={editingSubject ? '编辑学科' : '添加学科'}
        open={isSubjectModalVisible}
        onOk={handleSubjectOk}
        onCancel={() => setIsSubjectModalVisible(false)}
      >
        <Form form={subjectForm} layout="vertical">
          <Form.Item
            name="name"
            label="学科名称"
            rules={[{ required: true, message: '请输入学科名称' }]}
          >
            <Input placeholder="请输入学科名称" />
          </Form.Item>
        </Form>
        
        {/* 显示现有学科列表 */}
        <div style={{ marginTop: 16 }}>
          <h4>现有学科列表：</h4>
          <ul style={{ paddingLeft: 20 }}>
            {subjects.map(subject => (
              <li key={subject.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {subject.name}
                <Space>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={() => showSubjectModal(subject)}
                  />
                  <Button 
                    type="text" 
                    danger 
                    size="small" 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteSubject(subject.id)}
                  />
                </Space>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default RewardsManagement;
