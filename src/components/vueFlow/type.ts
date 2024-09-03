import type { Ref } from 'vue'
import { TopicNodeProps } from '@/components/Node/topicNode/type.ts'
import { GroupNodeProps } from '@/components/Node/groupNode/type.ts'
import { IdeaNodeProps } from '@/components/Node/ideaNode/type.ts'
import { Position } from '@vue-flow/core'

export enum LayoutDirection {
  Vertical = 'TB', // 上下排列
  Horizontal = 'LR', // 左右排列
}

export enum NodeType {
  Idea = 'idea',
  Group = 'group',
  Topic = 'topic',
}

export enum EdgeType {
  idea_to_group = 'idea_to_group',
  group_to_discuss = 'group_to_discuss',
  approve = 'approve',
  reject = 'reject',
}

export interface VueFlowNode {
  id: string // 节点id
  type: "idea" | "group" | "topic" // 节点类型
  position: {
    // 节点初始位置
    x: number
    y: number
  }
  data: TopicNodeProps | GroupNodeProps | IdeaNodeProps
}

export interface VueFlowEdge {
  id: string // 边的id
  source: string // 边的源头节点id
  target: string // 边的重点节点id
  animated: boolean // 是否开启过渡动画
  _type: EdgeType // 边的类型
  style: {
    stroke: string | Ref<string> // 线的颜色
  }
}

/**
 * 
 */
export interface TopicNode {
  text: string
  sourcePosition: Position
  targetPosition: Position
}

export interface IdeaNode {
  name: string
  id: string
  bgc: string
  student_id: string
  highlight?: boolean
  targetPosition: Position
  sourcePosition: Position
}

export interface GroupNode {
  groupName: string
  groupConclusion: string
  bgc: string
  group_id: number
  targetPosition: Position
  sourcePosition: Position
}

export interface Node {
  id: string
  type: 'idea' | 'group' | 'topic'
  position: {
    x: number
    y: number
  }
  data: TopicNode | IdeaNode | GroupNode
}

export interface Edge {
  id: string
  source: string
  target: string
  _type: "idea_to_group" | "group_to_discuss" | "approve" | "reject"
  animated: boolean
  style: {
    stroke: string
  }
}


export type LayoutDir = 'TB' | 'LR'