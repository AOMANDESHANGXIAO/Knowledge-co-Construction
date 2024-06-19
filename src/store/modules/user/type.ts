interface User {
  id: string;
  username: string;
  nickname: string;
  token: string;
  belongGroupId?: string;
  belongGroupName?: string;
  belongGroupColor?: string;
  belongGroupCode?: string;
}

export type { User };
