import { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Child } from '../types';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

interface ChildrenManagementProps {
  children: Child[];
  onSave: (children: Child[]) => void;
}

const ChildrenManagement: React.FC<ChildrenManagementProps> = ({ children, onSave }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  // const [fileName, setFileName] = useState<string>('');

  // 打开添加/编辑模态框
  const showModal = (child?: Child) => {
    setEditingChild(child || null);
    setAvatarUrl(child?.avatar || '');
    form.resetFields();
    
    if (child) {
      form.setFieldsValue({
        name: child.name,
        birthDate: child.birthDate ? dayjs(child.birthDate) : undefined,
      });
    }
    
    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const updatedChild: Child = {
        id: editingChild?.id || uuidv4(),
        name: values.name,
        birthDate: values.birthDate.format('YYYY-MM-DD'),
        avatar: avatarUrl,
      };
      
      let updatedChildren: Child[];
      
      if (editingChild) {
        // 编辑现有孩子
        updatedChildren = children.map(child => 
          child.id === editingChild.id ? updatedChild : child
        );
      } else {
        // 添加新孩子
        updatedChildren = [...children, updatedChild];
      }
      
      await onSave(updatedChildren);
      setIsModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理删除孩子
  const handleDelete = async (childId: string) => {
    const updatedChildren = children.filter(child => child.id !== childId);
    await onSave(updatedChildren);
    message.success('删除成功');
  };

  // 处理上传头像
  const handleSelectImage = async () => {
    try {
      message.loading('正在选择图片...', 0.5);
      const result = await window.electronAPI.selectImage();
      
      if (result.error) {
        message.error(result.error);
        return;
      }
      
      if (!result.canceled && result.filePath) {
        // 添加file://协议头
        setAvatarUrl(`file://${result.filePath}`);
        // setFileName(result.fileName || '');
        message.success('图片选择成功');
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      message.error('选择图片失败，请重试');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => (
        avatar ? <img src={avatar} alt="头像" style={{ width: 50, height: 50, borderRadius: '50%' }} /> : '无头像'
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '出生日期',
      dataIndex: 'birthDate',
      key: 'birthDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Child) => (
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
            title="确定要删除这个孩子吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加孩子
        </Button>
      </div>
      
      <Table 
        dataSource={children} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
      />
      
      <Modal
        title={editingChild ? '编辑孩子信息' : '添加孩子'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入孩子姓名" />
          </Form.Item>
          
          <Form.Item
            name="birthDate"
            label="出生日期"
            rules={[{ required: true, message: '请选择出生日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="头像">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt="头像预览" 
                  style={{ width: 100, height: 100, marginRight: 16, borderRadius: '50%' }} 
                />
              )}
              <Button icon={<UploadOutlined />} onClick={handleSelectImage}>
                选择头像
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChildrenManagement;