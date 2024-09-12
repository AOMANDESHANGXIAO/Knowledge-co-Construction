import { ArgumentType } from '@/views/Home/components/ArgumentFlowComponent/type'
import { GraphSeriesOption, BarSeriesOption } from 'echarts/charts'
import type { ComposeOption } from 'echarts/core'

interface CreateNewIdeaArgs {
  topic_id: number
  student_id: number
  nodes: Array<{
    id: string
    data: {
      inputValue: string
      _type: string
    }
    type: 'element' | string
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    _type: string
  }>
}
/**
 * @deprecated
 */
interface ProposeIdeaParams {
  topic_id: number
  student_id: number
  nodes: ArgumentNode[]
  edges: ArgumentEdge[]
  [property: string]: any
}

interface ReplyIdeaParams extends CreateNewIdeaArgs {
  replyType: 'approve' | 'reject'
  replyNodeId: number
}

interface ModifyIdeaParams extends CreateNewIdeaArgs {
  modifyNodeId: number
}

interface ProposeGroupConclusionParams
  extends Omit<CreateNewIdeaArgs, 'topic_id'> {
  groupNodeId: string
}

interface ModifyGroupConclusionParams extends ProposeGroupConclusionParams {}

interface ReviseGroupConclusionParams {
  topic_id: number
  student_id: number
  group_id: number
  conclusion: string
}

interface ReviseSelfIdeaParams {
  node_id: number
  content: string
  student_id: number
}

/**
 * @deprecated
 */
interface QueryFlowData {
  edges: Edge[]
  nodes: Node[]
  [property: string]: any
}

interface Edge {
  id: string
  source: string
  target: string
  type: string
  [property: string]: any
}

interface Node {
  data: NodeData
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  [property: string]: any
}

interface NodeData {
  groupConclusion?: string
  groupName?: string
  id: number
  name: string
  text?: string
  [property: string]: any
}

interface ArgumentNode {
  id: string
  data: {
    inputValue: string
    _type: ArgumentType
  }
  _type: ArgumentType
  position: {
    x: number
    y: number
  }
  type: 'element'
  [property: string]: any
}

interface ArgumentEdge {
  id: string
  source: string
  target: string
  _type: string
}

interface QueryNodeContentData {
  nodes: Pick<ArgumentNode, 'id' | 'data' | 'type' | 'position' | '_type'>[]
  edges: ArgumentEdge[]
  [property: string]: any
}

interface NodeResponseBased<T extends 'idea' | 'group' | 'topic', D> {
  id: string
  type: T
  position: {
    x: number
    y: number
  }
  data: D
}
interface EdgeResponse {
  id: string
  source: string
  target: string
  _type: 'idea_to_group' | 'group_to_discuss' | 'approve' | 'reject'
  animated: boolean
}

interface QueryFlowResponse {
  nodes: Array<
    | NodeResponseBased<
        'idea',
        {
          name: string
          id: number
          bgc: string
          student_id: number
        }
      >
    | NodeResponseBased<
        'group',
        {
          groupName: string
          groupConclusion: string
          bgc: string
          group_id: number
          node_id: string
        }
      >
    | NodeResponseBased<'topic', { text: string }>
  >
  edges: Array<EdgeResponse>
}

interface QueryDashBoardResponse {
  radarOption: {
    radar: {
      indicator: Array<{ name: string; max: number }>
    }
    legend: { data: Array<string> }
    title: {
      text: string
    }
    series: {
      name: string
      type: 'radar'
      data: Array<{
        value: Array<number>
        name: string
      }>
    }
  }
  graphOption: ComposeOption<GraphSeriesOption>
  barOption: ComposeOption<BarSeriesOption>
}

export type {
  ProposeIdeaParams,
  ReplyIdeaParams,
  ReviseGroupConclusionParams,
  ReviseSelfIdeaParams,
  QueryFlowData,
  QueryNodeContentData,
  CreateNewIdeaArgs,
  QueryFlowResponse,
  ModifyIdeaParams,
  ProposeGroupConclusionParams,
  ModifyGroupConclusionParams,
  QueryDashBoardResponse,
}
