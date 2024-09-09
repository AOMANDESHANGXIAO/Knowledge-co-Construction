import { convertToHTML } from '../utils'
import { NodeType, EdgeType } from '../type'
import { Condition } from '../type'
import { Ref } from 'vue'
/**
 * 用于处理右下角的提示词
 * TODO: 重构提示词逻辑
 */
export default function useTips(props: {
  condition: Condition
  topicContent: string
  textualizedArgument: {
    nodes: Ref<NodeType[]>
    edges: Ref<EdgeType[]>
  }
}) {
  const MAX_CONTENT_WIDTH = '400px'
  const MIN_CONTENT_WIDTH = '20px'
  const { condition, topicContent } = props

  const { nodes, edges } = props.textualizedArgument

  const contentStyle = ref({
    width: MAX_CONTENT_WIDTH,
    transition: 'width 0.3s',
  })

  const handleToggleFold = () => {
    // 折叠
    if (contentStyle.value.width === MIN_CONTENT_WIDTH) {
      contentStyle.value.width = MAX_CONTENT_WIDTH
    } else {
      contentStyle.value.width = MIN_CONTENT_WIDTH
    }
  }

  const titleMap: Record<Condition, string> = {
    chechIdea: '检查观点',
    checkConclusion: '检查结论',
    modifyIdea: '修改观点',
    modifyConclusion: '修改结论',
    replyIdea: '回复观点',
    proposeIdea: '提出观点',
    proposeConclusion: '提出结论',
  }

  const title = computed(() => {
    return titleMap[condition]
  })

  const contentRenderCondition: {
    [key: string]: Array<Condition>
  } = {
    argument: ['chechIdea', 'checkConclusion', 'replyIdea'],
    topic: [
      'modifyConclusion',
      'modifyIdea',
      'proposeConclusion',
      'proposeIdea',
    ],
  }

  const content = computed(() => {
    // 1. 如果在检查观点，那么应该渲染检查观点的内容
    if (contentRenderCondition.argument.includes(condition)) {
      console.log('convertToHTML', nodes.value, edges.value)
      return convertToHTML({ nodes: nodes.value, edges: edges.value })
    } else if (contentRenderCondition.topic.includes(condition)) {
      return topicContent
    }
  })

  return {
    title,
    content,
    contentStyle,
    handleToggleFold,
    MAX_CONTENT_WIDTH,
    MIN_CONTENT_WIDTH,
  }
}
