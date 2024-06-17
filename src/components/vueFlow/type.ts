import type { Ref } from "vue";
import { TopicNodeProps } from "@/components/Node/topicNode/type.ts";
import { GroupNodeProps } from "@/components/Node/groupNode/type.ts";
import { IdeaNodeProps } from "@/components/Node/ideaNode/type.ts";

export enum LayoutDirection {
  Vertical = "TB", // 上下排列
  Horizontal = "LR", // 左右排列
}

export enum NodeType {
  Idea = "idea",
  Group = "group",
  Topic = "topic",
}

export interface VueFlowNode {
  id: string; // 节点id
  type: NodeType; // 节点类型
  label?: string; // 节点的标签
  position: {
    // 节点初始位置
    x: number;
    y: number;
  };
  data: TopicNodeProps | GroupNodeProps | IdeaNodeProps;
}

export interface VueFlowEdge {
  id: string; // 边的id
  source: string; // 边的源头节点id
  target: string; // 边的重点节点id
  animated: boolean; // 是否开启过渡动画
  style: {
    stroke: string | Ref<string>; // 线的颜色
  };
}
