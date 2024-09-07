import { convertToHTML } from '../utils'
import { NodeType, EdgeType } from '../type'
import { Ref } from 'vue'
import { Action } from '../type'

/**
 * 用于处理右下角的提示词
 */
export default function useTips(props: {
  action: Action
  reply: 'none' | 'approve' | 'reject'
  topicContent: string
  textualizedArgument: {
    nodes: Ref<NodeType[]>
    edges: Ref<EdgeType[]>
  }
}) {
  const MAX_CONTENT_WIDTH = '400px'
  const MIN_CONTENT_WIDTH = '20px'

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

  const title = computed(() => {
    const { reply, action } = props
    if (action === Action.Check) {
      if (reply === 'approve') return '支持观点'
      if (reply === 'reject') return '反对观点'
      return '检查观点'
    } else if (action === Action.Modify) {
      return '话题'
    }
  })

  const content = computed(() => {
    const { reply, action, topicContent } = props

    /**
     * 如果正在回应其他人的观点，或者正在检查观点则文本化论证图
     */
    if (action === Action.Check || reply === 'approve' || reply === 'reject') {
      // 文本化论证图
      return convertToHTML({ nodes: nodes.value, edges: edges.value })
    }

    /**
     * 如果正在修改自己的论证，则不文本化视图，而是要提示目前正在论证的题目
     */
    if (action === Action.Modify) {
      console.log('topicContent', topicContent)
      return topicContent
    }

    return ''
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
