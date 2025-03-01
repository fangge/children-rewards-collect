import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 孩子信息管理
  saveChildren: (children: any) => ipcRenderer.invoke('save-children', children),
  getChildren: () => ipcRenderer.invoke('get-children'),
  
  // 奖项管理
  saveRewards: (rewards: any) => ipcRenderer.invoke('save-rewards', rewards),
  getRewards: () => ipcRenderer.invoke('get-rewards'),
  
  // 图片管理
  saveImage: (imageData: string, fileName: string) => 
    ipcRenderer.invoke('save-image', { imageData, fileName }),
  selectImage: () => ipcRenderer.invoke('select-image'),
  
  // 数据导入导出
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data')
})