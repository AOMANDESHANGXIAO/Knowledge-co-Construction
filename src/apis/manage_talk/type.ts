/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-13 13:47:08
 * @Description  : 
 */

interface TopicListData {
  list: ListItem[];
  [property: string]: any;
}

interface ListItem {
  created_time?: string;
  created_user_name?: string;
  id?: number;
  topic_content?: string;
  [property: string]: any;
}

export type {
  TopicListData
}