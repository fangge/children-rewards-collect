const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // 孩子信息管理
  saveChildren: (children) => ipcRenderer.invoke("save-children", children),
  getChildren: () => ipcRenderer.invoke("get-children"),
  // 奖项管理
  saveRewards: (rewards) => ipcRenderer.invoke("save-rewards", rewards),
  getRewards: () => ipcRenderer.invoke("get-rewards"),
  // 图片管理
  saveImage: (params) => ipcRenderer.invoke("save-image", params),
  selectImage: () => ipcRenderer.invoke("select-image"),
  // 数据目录管理
  setDataDir: (path) => ipcRenderer.invoke("set-data-dir", path),
  getDataDir: () => ipcRenderer.invoke("get-data-dir"),
  selectDataDir: () => ipcRenderer.invoke("select-data-dir"),
  // 数据导入导出
  exportData: () => ipcRenderer.invoke("export-data"),
  importData: () => ipcRenderer.invoke("import-data")
});
