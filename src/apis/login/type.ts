interface SignInParams {
  class_id: number
  username: string
  nickname: string
  password: string
}

interface SignUpParams {
  username: string
  password: string
}

interface ListItem {
  id: number
  class_name: string
}

interface ClassRoomList {
  list: Array<ListItem>
}

interface SignInData {
  class_id: number;
  group_id: null | number;
  id: number;
  nickname: string;
  token: string;
  username: string;
  [property: string]: any;
}

interface SignUpData {
  [property: string]: any;
}

export type { ClassRoomList, SignUpParams, SignInParams, SignInData, SignUpData }
