interface User {
  id: number;
  username: string;
  nickname: string;
  token: string;
  class_id: number;
  group_id?: number | null;
  group_name?: string;
  group_color?: string;
  group_code?: string;
}

export type { User };
