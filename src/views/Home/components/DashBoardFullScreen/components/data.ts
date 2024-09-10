/**
 * 测试数据
 */
type DashBoardItem = {
  title: string;
  type: 'success' | 'warning' | 'error' | 'info';
  suggestions: string[];
};

const dev_data: DashBoardItem[] = [
  {
    title: 'Great Job!',
    type: 'success',
    suggestions: ['继续努力，保持良好的学习状态', '多参加小组讨论'],
  },
  {
    title: 'You can do better!',
    type: 'warning',
    suggestions: ['注意时间管理', '提高学习效率'],
  },
  {
    title: 'Keep working!',
    type: 'error',
    suggestions: ['加强团队协作', '定期进行项目进度汇报'],
  },
];

export {
  dev_data,
}