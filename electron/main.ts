import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ElectronStore from 'electron-store';
import isDev from 'electron-is-dev';

// 初始化存储
const store = new ElectronStore({
  name: 'children-rewards-data',
  fileExtension: 'json'
});

// 获取用户数据目录下的images子目录
const imagesDir = path.join(app.getPath('userData'), 'images');

// 在app ready事件中
app.whenReady().then(() => {
  // 创建图片存储目录
  fs.mkdirSync(imagesDir, {
    recursive: true,
    mode: 0o755 // 设置目录权限为rwxr-xr-x
  });
});

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理程序

// 保存孩子信息
ipcMain.handle('save-children', (_event, children) => {
  store.set('children', children);
  return { success: true };
});

// 获取孩子信息
ipcMain.handle('get-children', () => {
  return store.get('children', []);
});

// 保存奖项信息
ipcMain.handle('save-rewards', (_event, rewards) => {
  store.set('rewards', rewards);
  return { success: true };
});

// 获取奖项信息
ipcMain.handle('get-rewards', () => {
  return store.get('rewards', []);
});

// 保存图片
ipcMain.handle('save-image', async (_event, { imageData, fileName }) => {
  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imagePath = path.join(imagesDir, fileName);
    fs.writeFileSync(imagePath, buffer);
    return { success: true, path: imagePath };
  } catch (error) {
    console.error('保存图片失败:', error);
    return { success: false, error: String(error) };
  }
});

// 选择图片
ipcMain.handle('select-image', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
    });

    if (result.canceled) return { canceled: true };

    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    const targetPath = path.join(imagesDir, fileName);

    // 确保目标目录存在
    await fs.promises.mkdir(imagesDir, { recursive: true });

    // 复制文件并设置权限
    await fs.promises.copyFile(sourcePath, targetPath);
    await fs.promises.chmod(targetPath, 0o644); // 设置文件权限为rw-r--r--

    return {
      canceled: false,
      filePath: targetPath,
      fileName
    };
  } catch (error) {
    console.error('文件操作失败:', error);
    return {
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
});

// 导出数据
ipcMain.handle('export-data', async () => {
  if (!mainWindow) return { success: false, error: '窗口未创建' };

  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出数据',
    defaultPath: path.join(
      app.getPath('documents'),
      'children-rewards-data.json'
    ),
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  try {
    const data = {
      children: store.get('children', []),
      rewards: store.get('rewards', [])
    };

    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('导出数据失败:', error);
    return { success: false, error: String(error) };
  }
});

// 导入数据
ipcMain.handle('import-data', async () => {
  if (!mainWindow) return { success: false, error: '窗口未创建' };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: '导入数据',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  try {
    const filePath = result.filePaths[0];
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);

    if (data.children) store.set('children', data.children);
    if (data.rewards) store.set('rewards', data.rewards);

    return { success: true };
  } catch (error) {
    console.error('导入数据失败:', error);
    return { success: false, error: String(error) };
  }
});
