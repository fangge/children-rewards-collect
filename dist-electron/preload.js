const { contextBridge: i, ipcRenderer: e } = require("electron");
i.exposeInMainWorld("electronAPI", {
  // 孩子信息管理
  saveChildren: (a) => e.invoke("save-children", a),
  getChildren: () => e.invoke("get-children"),
  // 奖项管理
  saveRewards: (a) => e.invoke("save-rewards", a),
  getRewards: () => e.invoke("get-rewards"),
  // 图片管理
  saveImage: (a, r) => e.invoke("save-image", { imageData: a, fileName: r }),
  selectImage: () => e.invoke("select-image"),
  // 数据导入导出
  exportData: () => e.invoke("export-data"),
  importData: () => e.invoke("import-data")
});
