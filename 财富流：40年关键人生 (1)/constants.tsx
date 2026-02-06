
import { Career } from './types';

export const CAREERS: Career[] = [
  { id: 'sales', title: '销售经理', income: 15000, expenses: 9000, tag: '高薪高压', description: '适合激进者，奖金丰厚但极其损耗心力。' },
  { id: 'nurse', title: '护士', income: 7000, expenses: 3000, tag: '稳定节俭', description: '适合保守派，生活简单，心力储备充足。' },
  { id: 'pm', title: '产品经理', income: 20000, expenses: 13000, tag: '高收高支', description: '典型的城市中产，晋升快但基本没闲钱。' },
  { id: 'finance', title: '财务主管', income: 25000, expenses: 18000, tag: '专业精英', description: '虽然支出极高，但拥有极佳的资产管理眼光。' },
  { id: 'hr', title: 'HR经理', income: 12000, expenses: 5000, tag: '心力充沛', description: '工作平衡，有更多心力去打理副业和投资。' },
];

export const INITIAL_ENERGY = 10; // 从100缩减到10，每一点都是关键
export const WIN_THRESHOLDS = {
  WEALTH_CREATOR: 100000000, // 1亿
  CHARITY: 10000000, // 1000万
};
