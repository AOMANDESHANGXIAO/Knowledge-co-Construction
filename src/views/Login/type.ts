export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  class_id: number | undefined;
  username: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

export interface classItem {
  id: number
  class_name: string
}