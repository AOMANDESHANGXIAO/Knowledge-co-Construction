import {
  NodeType,
  EdgeType,
} from '@/views/Home/components/ArgumentFlowComponent/type'
import {
  proposeIdeaApi,
  replyIdeaApi,
  modifyIdeaApi,
  proposeGroupConclusionApi,
  modifyGroupConclusionApi,
} from '@/apis/flow'
import { CreateNewIdeaArgs } from '@/apis/flow/type'
import useRequest from '@/hooks/Async/useRequest'
/**
 *
 * @param nodes
 * @returns
 * @description 这个函数被用来格式化发送请求时的Node列表
 */
const formatterRequestNode = (
  nodes: CreateNewIdeaArgs['nodes']
): Array<{
  id: string
  data: {
    inputValue: string
    _type: string
  }
  type: 'element'
}> => {
  return nodes.map(node => ({
    id: node.id,
    data: {
      inputValue: node.data.inputValue,
      _type: node.data._type as string,
    },
    type: 'element',
  }))
}

export default function useSumbit({
  onSuccess,
  onFail,
}: {
  onSuccess: () => void
  onFail: () => void
}) {
  const submitProposeIdea = ({
    topic_id,
    student_id,
    nodes,
    edges,
  }: {
    topic_id: number
    student_id: number
    nodes: NodeType[]
    edges: EdgeType[]
  }) => {
    useRequest({
      apiFn: async () =>
        await proposeIdeaApi({
          topic_id,
          student_id,
          nodes: formatterRequestNode(nodes),
          edges,
        }),
      onSuccess: onSuccess,
      onFail: onFail,
      immediate: true,
    })
  }

  const submitModifyIdea = ({
    modifyNodeId,
    topic_id,
    student_id,
    nodes,
    edges,
  }: {
    modifyNodeId: number
    topic_id: number
    student_id: number
    nodes: NodeType[]
    edges: EdgeType[]
  }) => {
    useRequest({
      apiFn: async () =>
        await modifyIdeaApi({
          modifyNodeId,
          topic_id,
          student_id,
          nodes: formatterRequestNode(nodes),
          edges,
        }),
      onSuccess: onSuccess,
      onFail: onFail,
      immediate: true,
    })
  }

  const submitReplyIdea = ({
    replyType,
    replyNodeId,
    topic_id,
    student_id,
    nodes,
    edges,
  }: {
    replyType: 'approve' | 'reject'
    replyNodeId: number
    topic_id: number
    student_id: number
    nodes: NodeType[]
    edges: EdgeType[]
  }) => {
    useRequest({
      apiFn: async () =>
        await replyIdeaApi({
          replyType,
          replyNodeId,
          topic_id,
          student_id,
          nodes: formatterRequestNode(nodes),
          edges,
        }),
      onSuccess: onSuccess,
      onFail: onFail,
      immediate: true,
    })
  }

  const submitProposeGroupConclusion = ({
    student_id,
    groupNodeId,
    nodes,
    edges,
  }: {
    student_id: number
    groupNodeId: string
    nodes: NodeType[]
    edges: EdgeType[]
  }) => {
    useRequest({
      apiFn: async () =>
        await proposeGroupConclusionApi({
          student_id,
          groupNodeId,
          nodes: formatterRequestNode(nodes),
          edges,
        }),
      onSuccess: onSuccess,
      onFail: onFail,
      immediate: true,
    })
  }

  const submitModifyGroupConclusion = ({
    student_id,
    groupNodeId,
    nodes,
    edges,
  }: {
    student_id: number
    groupNodeId: string
    nodes: NodeType[]
    edges: EdgeType[]
  }) => {
    useRequest({
      apiFn: async () =>
        await modifyGroupConclusionApi({
          student_id,
          groupNodeId,
          nodes: formatterRequestNode(nodes),
          edges,
        }),
      onSuccess: onSuccess,
      onFail: onFail,
      immediate: true,
    })
  }

  return {
    submitProposeIdea,
    submitModifyIdea,
    submitReplyIdea,
    submitProposeGroupConclusion,
    submitModifyGroupConclusion
  }
}
