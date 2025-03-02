import { useState, useEffect } from 'react'
import { Layout, Menu, theme, message, Button, Modal, Input, Alert } from 'antd'
import { UserOutlined, TrophyOutlined, ImportOutlined, ExportOutlined, CrownOutlined } from '@ant-design/icons'
import './App.css'
import { Child, Reward } from './types'
import ChildrenManagement from './components/ChildrenManagement'
import RewardsManagement from './components/RewardsManagement'
import RewardsDisplay from './components/RewardsDisplay'

// 组件定义
const { Header, Content, Sider } = Layout

function App() {
  const [activeKey, setActiveKey] = useState('children')
  const [children, setChildren] = useState<Child[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [isDataDirModalVisible, setIsDataDirModalVisible] = useState(false)
  const [currentDataDir, setCurrentDataDir] = useState('')
  
  const { token } = theme.useToken()

  const loadData = async () => {
    try {
      setLoading(true)
      const childrenData = await window.electronAPI.getChildren()
      const rewardsData = await window.electronAPI.getRewards()
      setChildren(childrenData)
      setRewards(rewardsData)
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 检查数据目录
  useEffect(() => {
    const checkDataDir = async () => {
      try {
        const dataDir = await window.electronAPI.getDataDir()
        setCurrentDataDir(dataDir)
      } catch (error) {
        console.error('获取数据目录失败:', error)
        message.error('获取数据目录失败')
      }
    }
    checkDataDir()
  }, [])

  // 设置数据目录
  const handleSetDataDir = async () => {
    try {
      const result = await window.electronAPI.setDataDir(currentDataDir)
      if (result.success) {
        setIsDataDirModalVisible(false)
        message.success('数据目录设置成功')
        // 重新加载数据
        loadData()
      } else {
        message.error(`设置数据目录失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('设置数据目录失败:', error)
      message.error('设置数据目录失败')
    }
  }

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])
  
  // 保存孩子信息
  const saveChildren = async (updatedChildren: Child[]) => {
    try {
      await window.electronAPI.saveChildren(updatedChildren)
      setChildren(updatedChildren)
      message.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    }
  }
  
  // 保存奖项信息
  const saveRewards = async (updatedRewards: Reward[]) => {
    try {
      await window.electronAPI.saveRewards(updatedRewards)
      setRewards(updatedRewards)
      message.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    }
  }
  
  // 导出数据
  const handleExport = async () => {
    try {
      const result = await window.electronAPI.exportData()
      if (result.success) {
        message.success('数据导出成功')
      } else if (!result.canceled) {
        message.error(`导出失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败')
    }
  }
  
  // 导入数据
  const handleImport = async () => {
    try {
      const result = await window.electronAPI.importData()
      if (result.success) {
        // 重新加载数据
        const childrenData = await window.electronAPI.getChildren()
        const rewardsData = await window.electronAPI.getRewards()
        setChildren(childrenData)
        setRewards(rewardsData)
        message.success('数据导入成功')
      } else if (!result.canceled) {
        message.error(`导入失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('导入失败:', error)
      message.error('导入失败')
    }
  }
  
  // 选择数据目录
  const handleSelectDir = async () => {
    try {
      const result = await window.electronAPI.selectDataDir()
      if (!result.canceled && result.path) {
        setCurrentDataDir(result.path)
      }
    } catch (error) {
      console.error('选择目录失败:', error)
      message.error('选择目录失败')
    }
  }

  // 渲染内容
  const renderContent = () => {
    switch (activeKey) {
      case 'children':
        return <ChildrenManagement children={children} onSave={saveChildren} />
      case 'rewards':
        return <RewardsManagement children={children} rewards={rewards} onSave={saveRewards} />
      case 'display':
        return <RewardsDisplay children={children} rewards={rewards} loading={loading} />
      default:
        return <div>选择一个选项</div>
    }
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Modal
        title="设置数据存储目录"
        open={isDataDirModalVisible}
        onOk={handleSetDataDir}
        onCancel={() => setIsDataDirModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={currentDataDir}
          onChange={(e) => setCurrentDataDir(e.target.value)}
          placeholder="请输入数据存储目录路径"
          style={{ marginBottom: 16 }}
          addonAfter={
            <Button type="link" onClick={handleSelectDir} style={{ padding: 0 }}>
              选择目录
            </Button>
          }
        />
        <Alert
          message="提示"
          description="请选择一个目录来存储所有数据，包括配置文件和图片。如果不设置，将使用默认目录。"
          type="info"
          showIcon
        />
      </Modal>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          儿童奖项收集
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button 
            type="primary" 
            icon={<ExportOutlined />} 
            onClick={handleExport}
            style={{ marginRight: 8 }}
          >
            导出数据
          </Button>
          <Button 
            type="primary" 
            icon={<ImportOutlined />} 
            onClick={handleImport}
            style={{ marginRight: 8 }}
          >
            导入数据
          </Button>
          <Button
            type="primary"
            onClick={() => setIsDataDirModalVisible(true)}
          >
            设置数据目录
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: token.colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: 'children',
                icon: <UserOutlined />,
                label: '孩子管理',
              },
              {
                key: 'rewards',
                icon: <TrophyOutlined />,
                label: '奖项管理',
              },
              {
                key: 'display',
                icon: <CrownOutlined />,
                label: '奖状展示',
              },
            ]}
            onSelect={({ key }) => setActiveKey(key)}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
