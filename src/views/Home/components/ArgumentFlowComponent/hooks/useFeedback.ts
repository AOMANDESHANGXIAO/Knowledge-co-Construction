import { NodeType, ArgumentType, EdgeType } from '../type'
import { useNodeEdgeHandler } from '@/utils/nodeEdgeHandler/index.ts'
import { Ref, ComputedRef } from 'vue'

interface FeedBack {
  title: string
  type: 'success' | 'warning' | 'error' | 'info'
  description: string
  [propName: string]: any
}

interface FBOpt {
  [key: string]: {
    title: string
    description: string
    type: 'success' | 'warning' | 'error' | 'info'
  }
}

function useFeedback({
  nodes,
  edges,
}: {
  nodes: Ref<NodeType[]>
  edges: Ref<EdgeType[]>
}) {
  const feedbackList: ComputedRef<FeedBack[]> = computed(() => {
    return feedbackCallback(nodes.value, edges.value)
  })

  const { findIsEdgeExistByFilterFunction } = useNodeEdgeHandler()

  const feedbackOptions: FBOpt = {
    warrant: {
      title: '缺少辩护',
      description: '需要一个辩护来解释前提和结论的关系',
      type: 'warning',
    },
    qualifier: {
      title: '缺少限定词',
      description: '需要一个限定词来限制当前论点的范围',
      type: 'warning',
    },
    rebuttal: {
      title: '缺少反驳',
      description: '需要一个反驳来委婉化当前论点',
      type: 'warning',
    },
    backing: {
      title: '缺少支撑',
      description: '有一个辩护没有支撑!',
      type: 'warning',
    },
    perfect: {
      title: '论点完美',
      description: '这是一个结构完整的论证!',
      type: 'success',
    },
  }

  const feedbackCallback = (
    nodes: NodeType[],
    edges: EdgeType[]
  ): FeedBack[] => {
    const flagMap = {
      warrant: false, // 辩护
      rebuttal: false, // 反驳
      qualifier: false, // 限定词
    }

    const warrantsList: NodeType[] = []

    nodes.forEach(item => {
      const _type = item.data._type

      switch (_type) {
        case ArgumentType.Warrant:
          flagMap.warrant = true
          warrantsList.push(item)
          break
        case ArgumentType.Qualifier:
          flagMap.qualifier = true
          break
        case ArgumentType.Rebuttal:
          flagMap.rebuttal = true
          break
        default:
          break
      }
    })

    // 查找有没有支撑
    let hasBacking = false

    for (let j = 0; j < warrantsList.length; j++) {
      const item = warrantsList[j]
      hasBacking = findIsEdgeExistByFilterFunction(edges, edge => {
        return (
          edge._type === `${ArgumentType.Backing}_${ArgumentType.Warrant}` &&
          edge.target === item.id
        )
      })
      // 没有支撑
      if (!hasBacking) break
    }

    // 根据flagMap，判断是否生成反馈
    let feedbacks = []
    Object.keys(flagMap).forEach(key => {
      if (!flagMap[key as keyof typeof flagMap]) {
        feedbacks.push({
          title: feedbackOptions[key as keyof typeof flagMap].title,
          description: feedbackOptions[key as keyof typeof flagMap].description,
          type: feedbackOptions[key as keyof typeof flagMap].type,
        })
      }
    })

    // 没有辩护时不会出现提示需要支撑
    if (warrantsList.length && !hasBacking) {
      feedbacks.push({
        title: feedbackOptions.backing.title,
        description: feedbackOptions.backing.description,
        type: feedbackOptions.backing.type,
      })
    }

    if (feedbacks.length === 0) {
      feedbacks.push({
        title: feedbackOptions.perfect.title,
        description: feedbackOptions.perfect.description,
        type: feedbackOptions.perfect.type,
      })
    }

    return feedbacks
  }

  return { feedbackList, feedbackCallback }
}

export default useFeedback
