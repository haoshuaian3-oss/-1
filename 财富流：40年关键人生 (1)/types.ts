
export enum GameNode {
  INTRO = -1,
  NODE_1 = 1, // 22岁
  NODE_2 = 2, // 23岁
  NODE_3 = 3, // 25岁
  NODE_4 = 4, // 26岁
  NODE_5 = 5, // 28岁
  NODE_6 = 6, // 30岁
  NODE_7 = 7, // 31岁
  NODE_8 = 8, // 33岁
  NODE_9 = 9, // 34岁
  NODE_10 = 10, // 35岁
  GAME_OVER = 11
}

export interface PlayerStats {
  age: number;
  monthlyIncome: number;
  passiveIncome: number;
  monthlyExpenses: number;
  cash: number;
  energy: number;
  energyMax: number;
  riskValue: number;
  careerPath: string; // 记录职业路线用于结尾评价
  decisions: string[]; // 记录关键选择
}

export interface DecisionOption {
  title: string;
  description: string;
  impact: (stats: PlayerStats) => PlayerStats;
}

// Added Career interface to fix: Module '"./types"' has no exported member 'Career'.
export interface Career {
  id: string;
  title: string;
  income: number;
  expenses: number;
  tag: string;
  description: string;
}
