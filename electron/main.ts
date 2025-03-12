import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ElectronStore from 'electron-store';
import isDev from 'electron-is-dev';

// 初始化存储
let store = new ElectronStore({
  name: 'children-rewards-data',
  fileExtension: 'json',
  cwd: app.getPath('userData') // 初始时使用默认的userData目录
});

// 获取数据存储目录
const getDataDir = () => {
  const customDir = store.get('dataDir') as string | undefined;
  return customDir || app.getPath('userData');
};

// 获取图片存储目录
const getImagesDir = () => path.join(getDataDir(), 'images');

// 获取当前图片目录
let imagesDir = getImagesDir();

// 在app ready事件中
app.whenReady().then(() => {
  // 创建图片存储目录
  fs.mkdirSync(imagesDir, {
    recursive: true,
    mode: 0o755 // 设置目录权限为rwxr-xr-x
  });
});

// 设置数据目录
ipcMain.handle('set-data-dir', async (_event, newPath: string) => {
  try {
    // 确保目录存在
    await fs.promises.mkdir(newPath, { recursive: true });

    // 保存新路径
    store.set('dataDir', newPath);

    // 更新图片目录
    const newImagesDir = path.join(newPath, 'images');
    await fs.promises.mkdir(newImagesDir, { recursive: true });

    // 如果旧目录存在且不同于新目录，复制所有文件
    if (imagesDir !== newImagesDir && fs.existsSync(imagesDir)) {
      const files = await fs.promises.readdir(imagesDir);
      for (const file of files) {
        const srcPath = path.join(imagesDir, file);
        const destPath = path.join(newImagesDir, file);
        await fs.promises.copyFile(srcPath, destPath);
      }
    }

    // 更新当前图片目录
    imagesDir = newImagesDir;

    // 重新初始化store以使用新目录
    const newStore = new ElectronStore({
      name: 'children-rewards-data',
      fileExtension: 'json',
      cwd: newPath
    });

    // 复制旧数据到新store
    const oldData = {
      children: store.get('children', []),
      rewards: store.get('rewards', []),
      subjects: store.get('subjects', [])
    };

    // 完全替换store实例
    store = newStore;

    // 保存数据到新位置
    store.set('children', oldData.children);
    store.set('rewards', oldData.rewards);
    store.set('subjects', oldData.subjects);

    return { success: true };
  } catch (error) {
    console.error('设置数据目录失败:', error);
    return { success: false, error: String(error) };
  }
});

// 获取当前数据目录
ipcMain.handle('get-data-dir', () => {
  return getDataDir();
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

  // 将数据同步到JSON文件
  try {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, 'children-rewards-data.json');

    // 如果文件存在，读取现有数据并更新
    let data = {
      children: children,
      rewards: store.get('rewards', []),
      subjects: store.get('subjects', []),
      dataDir: dataDir
    };

    if (fs.existsSync(filePath)) {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(fileData);
        // 合并数据，保留文件中的其他字段
        data = { ...existingData, children: children };
      } catch (readError) {
        console.error('读取JSON文件失败:', readError);
      }
    }

    // 写入更新后的数据
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('保存孩子信息到JSON文件失败:', error);
  }

  return { success: true };
});

// 获取孩子信息
ipcMain.handle('get-children', () => {
  try {
    // 尝试从数据目录下的JSON文件读取数据
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, 'children-rewards-data.json');

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      if (data && Array.isArray(data.children)) {
        // 更新store并返回数据
        store.set('children', data.children);
        return data.children;
      }
    }

    // 如果文件不存在或格式不正确，返回store中的数据
    return store.get('children', []);
  } catch (error) {
    console.error('读取孩子信息失败:', error);
    return store.get('children', []);
  }
});

// 获取奖项信息
ipcMain.handle('get-rewards', () => {
  try {
    // 尝试从数据目录下的JSON文件读取数据
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, 'children-rewards-data.json');

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      if (data && Array.isArray(data.rewards)) {
        // 确保所有奖项都有subjectId字段
        const processedRewards = data.rewards.map(reward => {
          if (!reward.subjectId) {
            // 如果没有subjectId字段，添加一个默认值
            return { ...reward, subjectId: '' };
          }
          return reward;
        });

        // 更新store并返回数据
        store.set('rewards', processedRewards);
        return processedRewards;
      }
    }

    // 如果文件不存在或格式不正确，返回store中的数据
    return store.get('rewards', []);
  } catch (error) {
    console.error('读取奖项信息失败:', error);
    return store.get('rewards', []);
  }
});

// 获取学科信息
ipcMain.handle('get-subjects', () => {
  try {
    // 尝试从数据目录下的JSON文件读取数据
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, 'children-rewards-data.json');

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      if (data && Array.isArray(data.subjects)) {
        // 更新store并返回数据
        store.set('subjects', data.subjects);
        return data.subjects;
      }
    }

    // 如果文件不存在或格式不正确，返回store中的数据
    return store.get('subjects', []);
  } catch (error) {
    console.error('读取学科信息失败:', error);
    return store.get('subjects', []);
  }
});

// 保存奖项信息
ipcMain.handle('save-rewards', (_event, rewards) => {
  // 确保所有奖项都有subjectId字段
  const processedRewards = rewards.map(reward => {
    if (!reward.subjectId) {
      // 如果没有subjectId字段，添加一个默认值
      return { ...reward, subjectId: '' };
    }
    return reward;
  });

  store.set('rewards', processedRewards);

  // 将数据同步到JSON文件
  try {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, 'children-rewards-data.json');

    // 如果文件存在，读取现有数据并更新
    let data = {
      children: store.get('children', []),
      rewards: processedRewards,
      subjects: store.get('subjects', []),
      dataDir: dataDir
    };

    if (fs.existsSync(filePath)) {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(fileData);
        // 合并数据，保留文件中的其他字段
        data = { ...existingData, rewards: processedRewards };
      } catch (readError) {
        console.error('读取JSON文件失败:', readError);
      }
    }

    // 写入更新后的数据
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('保存奖项信息到JSON文件失败:', error);
  }

  return { success: true };
});

// 保存学科信息
ipcMain.handle('save-subjects', (_event, subjects) => {
  store.set('subjects', subjects);

  // 将数据同步到JSON文件
  try {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, 'children-rewards-data.json');

    // 如果文件存在，读取现有数据并更新
    let data = {
      children: store.get('children', []),
      rewards: store.get('rewards', []),
      subjects: subjects,
      dataDir: dataDir
    };

    if (fs.existsSync(filePath)) {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(fileData);
        // 合并数据，保留文件中的其他字段
        data = { ...existingData, subjects: subjects };
      } catch (readError) {
        console.error('读取JSON文件失败:', readError);
      }
    }

    // 写入更新后的数据
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('保存学科信息到JSON文件失败:', error);
  }

  return { success: true };
});

// 保存图片
ipcMain.handle('save-image', async (_event, { imageData, fileName, date, subDir }) => {
  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 使用提供的 subDir 或者根据日期创建目录结构
    let targetDir;
    if (subDir) {
      targetDir = path.join(imagesDir, subDir);
    } else if (date) {
      const [year, month, day] = date.split('-');
      targetDir = path.join(imagesDir, year, month, day);
    } else {
      targetDir = imagesDir;
    }

    // 确保目录存在
    await fs.promises.mkdir(targetDir, { recursive: true });

    // 在目标目录下保存图片
    const imagePath = path.join(targetDir, fileName);
    await fs.promises.writeFile(imagePath, buffer);

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

    // 读取文件内容并转换为base64
    const imageBuffer = await fs.promises.readFile(sourcePath);
    const base64Data = `data:image/${path.extname(sourcePath).slice(1)};base64,${imageBuffer.toString('base64')}`;

    return {
      canceled: false,
      imageData: base64Data,
      fileName
    };
  } catch (error) {
    console.error('文件操作失败:', error);
    return {
      error: error instanceof Error ? error.message : '未知错误',
      canceled: true
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
      rewards: store.get('rewards', []),
      subjects: store.get('subjects', [])
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

    // 验证文件类型
    if (!filePath.toLowerCase().endsWith('.json')) {
      return { success: false, error: '只能导入JSON格式的文件' };
    }

    const fileData = fs.readFileSync(filePath, 'utf8');


    let data;
    try {
      data = JSON.parse(fileData);

    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return { success: false, error: '文件内容不是有效的JSON格式' };
    }

    // 验证数据格式
    if (!data || typeof data !== 'object') {
      console.error('无效的数据格式: 不是对象');
      return { success: false, error: '导入的数据格式不正确' };
    }

    if (!Array.isArray(data.children)) {
      console.error('无效的children数据:', data.children);
      return { success: false, error: '导入的children数据格式不正确' };
    }

    if (!Array.isArray(data.rewards)) {
      console.error('无效的rewards数据:', data.rewards);
      return { success: false, error: '导入的rewards数据格式不正确' };
    }

    // 验证学科数据格式
    if (data.subjects && !Array.isArray(data.subjects)) {
      console.error('无效的subjects数据:', data.subjects);
      return { success: false, error: '导入的subjects数据格式不正确' };
    }

    // 验证数组内容
    if (data.children.length === 0 && data.rewards.length === 0) {
      console.warn('警告：导入的数据为空');
    }

    // 询问用户是否合并数据
    const mergeChoice = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: '导入选项',
      message: '您想要如何处理现有数据？',
      buttons: ['合并数据', '替换数据'],
      defaultId: 0,
      cancelId: 1,
      detail: '合并数据：保留现有数据，并添加新数据\n替换数据：删除现有数据，仅保留导入的新数据'
    });

    const existingChildren = store.get('children', []) as Array<{
      id: string;
      name: string;
      // 其他可能的子属性
      birthDate: string;
      avatar: string
    }>;
    const existingRewards = store.get('rewards', []) as Array<{
      id: string;
      childId: string;
      date: string;
      activity: string;
      name: string;
      image: string;
      fileName: string;
      subjectId: string;
    }>;


    if (mergeChoice.response === 0) {
      // 合并数据
      const mergedChildren = [...existingChildren, ...data.children.filter(newChild =>
        !existingChildren.some(existing => existing.id === newChild.id)
      )];

      const mergedRewards = [...existingRewards, ...data.rewards.filter(newReward =>
        !existingRewards.some(existing => existing.id === newReward.id)
      )];

      // 合并学科数据
      const existingSubjects = store.get('subjects', []) as { id, name }[];
      const mergedSubjects = data.subjects ?
        [...existingSubjects, ...data.subjects.filter(newSubject =>
          !existingSubjects.some(existing => existing.id === newSubject.id)
        )] : existingSubjects;

      store.set('children', mergedChildren);
      store.set('rewards', mergedRewards);
      store.set('subjects', mergedSubjects);
    } else {
      // 替换数据
      store.set('children', data.children);
      store.set('rewards', data.rewards);

      // 如果有学科数据，也替换
      if (data.subjects) {
        store.set('subjects', data.subjects);
      }
    }

    // 验证数据是否成功保存
    const savedChildren = store.get('children', []) as Array<{
      id: string;
      name: string;
      // 其他可能的子属性
      birthDate: string;
      avatar: string
    }>;;
    const savedRewards = store.get('rewards', []) as Array<{
      id: string;
      childId: string;
      date: string;
      activity: string;
      name: string;
      image: string;
      fileName: string;
      subjectId: string;
    }>;;


    if (savedChildren.length === 0 && savedRewards.length === 0) {
      console.warn('警告：保存后的数据为空');
    }

    return { success: true };
  } catch (error) {
    console.error('导入数据失败:', error);
    return { success: false, error: String(error) };
  }
});

// 选择数据目录
ipcMain.handle('select-data-dir', async () => {
  if (!mainWindow) return { canceled: true };

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: '选择数据存储目录'
    });

    if (result.canceled) return { canceled: true };

    return {
      canceled: false,
      path: result.filePaths[0]
    };
  } catch (error) {
    console.error('选择目录失败:', error);
    return { error: String(error) };
  }
});
