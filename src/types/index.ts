// 孩子信息接口
export interface Child {
  id: string;
  name: string;
  birthDate: string;
  avatar?: string;
}

// 奖项信息接口
export interface Reward {
  id: string;
  childId: string;
  date: string;
  activity: string;
  name: string;
  image: string;
  fileName: string;
}

// 声明全局Window接口，添加Electron API
declare global {
  interface Window {
    electronAPI: {
      // 孩子信息管理
      saveChildren: (children: Child[]) => Promise<{ success: boolean }>;
      getChildren: () => Promise<Child[]>;

      // 奖项管理
      saveRewards: (rewards: Reward[]) => Promise<{ success: boolean }>;
      getRewards: () => Promise<Reward[]>;

      // 图片管理
      saveImage: (
        imageData: string,
        fileName: string
      ) => Promise<{ success: boolean; path: string; error?: string }>;
      selectImage: () => Promise<{
        canceled: boolean;
        filePath?: string;
        fileName?: string;
        error?: string;
      }>;

      // 数据导入导出
      exportData: () => Promise<{
        success: boolean;
        error?: string;
        canceled?: boolean;
      }>;
      importData: () => Promise<{
        success: boolean;
        error?: string;
        canceled?: boolean;
      }>;
    };
  }
}
