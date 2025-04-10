const { contextBridge: t, ipcRenderer: e } = require("electron");
t.exposeInMainWorld("electronAPI", {
  // 孩子信息管理
  saveChildren: (a) => e.invoke("save-children", a),
  getChildren: () => e.invoke("get-children"),
  // 证书管理
  saveRewards: (a) => e.invoke("save-rewards", a),
  getRewards: () => e.invoke("get-rewards"),
  // 学科管理
  saveSubjects: (a) => e.invoke("save-subjects", a),
  getSubjects: () => e.invoke("get-subjects"),
  // 图片管理
  saveImage: (a) => e.invoke("save-image", a),
  selectImage: () => e.invoke("select-image"),
  // 数据目录管理
  setDataDir: (a) => e.invoke("set-data-dir", a),
  getDataDir: () => e.invoke("get-data-dir"),
  selectDataDir: () => e.invoke("select-data-dir"),
  // 数据导入导出
  exportData: () => e.invoke("export-data"),
  importData: () => e.invoke("import-data")
});
