// 孩子信息接口
export interface Child {
  id: string;
  name: string;
  birthDate: string;
  avatar?: string;
  gender:string;
  hobbies?: string[];
}

// 学科信息接口
export interface Subject {
  id: string;
  name: string;
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
  subjectId: string; // 关联的学科ID
}

// 声明全局Window接口，添加Electron API
declare global {
  interface Window {
    electronAPI: {
      // 孩子信息管理
      saveChildren: (children: Child[]) => Promise<{ success: boolean }>;
      getChildren: () => Promise<Child[]>;

      // 证书管理
      saveRewards: (rewards: Reward[]) => Promise<{ success: boolean }>;
      getRewards: () => Promise<Reward[]>;
      
      // 学科管理
      saveSubjects: (subjects: Subject[]) => Promise<{ success: boolean }>;
      getSubjects: () => Promise<Subject[]>;

      // 图片管理
      saveImage: (obj: {
        imageData: string,
        fileName: string,
        date: string,
        subDir?: string
      }) => Promise<{ success: boolean; path: string; error?: string }>;
      selectImage: () => Promise<{
        canceled: boolean;
        filePath?: string;
        fileName?: string;
        imageData?: string;
        error?: string;
      }>;

      // 数据目录管理
      setDataDir: (path: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      getDataDir: () => Promise<string>;
      selectDataDir: () => Promise<{
        canceled: boolean;
        path?: string;
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
