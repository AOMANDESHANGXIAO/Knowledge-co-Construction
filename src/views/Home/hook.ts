// TODO: 重构index.vue中的代码，将逻辑部分抽离
// 避免组件过长，导致代码混乱
// 总共要实现六个功能,
// 1. 观点接口对接 (发送观点、总结观点、修改观点、支持观点、不支持观点) -- flowApi
// 2. 刷新 -- 路由
// 3. 返回首页 -- 路由
// 4. 设置 -- 布局
// 5. 垂直排列 -- 布局
// 6. 水平排列 -- 布局
import { ref, watch } from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'
import argumentFlowComponent from './components/ArgumentFlowComponent/index.vue'
import useState from '@/hooks/State/useState'
import { Status } from './components/ArgumentFlowComponent/type'
import { ElMessage, ElNotification } from 'element-plus'
import { proposeIdeaApi, replyIdeaApi, modifyIdeaApi } from '@/apis/flow'
import {
  CreateNewIdeaArgs,
  ReplyIdeaParams,
  ModifyIdeaParams,
} from '@/apis/flow/type'
import { LayoutDirection } from '../../components/vueFlow/type'
import useRequest from '@/hooks/Async/useRequest'
import useRefresh from '../../hooks/Element/useRefresh'
import { queryTopicContentApi } from '@/apis/manageTalk'
import { TopicContent } from '@/apis/manageTalk/type'
import { NodeType, EdgeType } from './components/ArgumentFlowComponent/type'

type IdeaAction =
  | 'propose'
  | 'check'
  | 'reply'
  | 'revise'
  | 'support'
  | 'unsupport'

const showWarningMsg = (msg: string) => {
  ElMessage({
    type: 'warning',
    message: msg,
    duration: 2000,
  })
}

const showNotification = (msg: string, type: 'success' | 'error') => {
  ElNotification({
    title: '提示',
    message: msg,
    type: type,
    position: 'bottom-right',
  })
}

interface UseMyVueFlowProps {
  topic_id: number
  student_id: number
}

function useMyVueFlow({ topic_id, student_id }: UseMyVueFlowProps) {
  // HTML Element references
  const argumentFlowRef = ref<InstanceType<
    typeof argumentFlowComponent
  > | null>(null)

  const vueFlowRef = ref<InstanceType<typeof flowComponent> | null>(null)

  const [visible, setVisible] = useState(false)

  const [sumbitStatus, setSumbitStatus, previousSubmitStatus] =
    useState<Status>(Status.Propose)

  const [loading, setLoading] = useState(false)

  const [nodeId, setNodeId] = useState('') // 被选中的node的id

  const [selectStudentId, setSelectStudentId] = useState('') // 被选中的node的发布者id

  const [reply, setReply] = useState<'none' | 'reject' | 'approve'>('none')

  const { key, refresh } = useRefresh()

  const refreshVueFlow = () => {
    vueFlowRef.value?.refreshData()
  }

  /**
   * 查询topic_id的话题信息
   */
  const topicContent = ref('')

  const { run: getTopicContent } = useRequest({
    apiFn: async () => await queryTopicContentApi(topic_id),
    onSuccess: (res: TopicContent) => {
      topicContent.value = res.topic_content
    },
    onError: () => {
      ElNotification({
        title: 'Error',
        message: '获取主题内容失败',
        type: 'error',
        position: 'bottom-right',
      })
    },
  })

  onMounted(() => {
    getTopicContent()
  })

  /**
   *
   * @param action
   * @param payload {id: string} id为node的Id
   * @returns
   */
  function handleIdeaAction(
    action: IdeaAction,
    payload?: { nodeId: string; studentId: string }
  ) {
    switch (action) {
      // 被用作提出观点
      case 'propose': {
        /**
         * use the argumentFlowRef to propose idea
         * we should make the dialog visible
         */
        setVisible(true)
        setSumbitStatus(Status.Propose)
        // 如果上一次就是提出观点状态,并且组件已经渲染出来
        if (
          !(
            previousSubmitStatus.value === Status.Propose &&
            argumentFlowRef.value
          )
        ) {
          refresh()
        } else {
          setReply('none')
        }
        return
      }
      // 被用作检查观点
      case 'check': {
        setSumbitStatus(Status.Check)
        const { nodeId, studentId } = payload as {
          nodeId: string
          studentId: string
        }
        setVisible(true)
        setNodeId(nodeId)
        setSelectStudentId(studentId) // 设置被选中的学生ID
        setReply('none')
        refresh()
        return
      }
    }
  }

  const { run: ModifyIdea } = useRequest({
    apiFn: async () => {
      const [nodes, edges] = [
        argumentFlowRef.value!.getArgumentNodes(),
        argumentFlowRef.value!.getArgumentEdges(),
      ]

      for (const node of nodes) {
        if (!node.data.inputValue) {
          showWarningMsg('请先填写观点内容')
          return
        }
      }

      const params: ModifyIdeaParams = {
        topic_id,
        student_id,
        modifyNodeId: +nodeId.value,
        nodes: nodes.map(node => ({
          id: node.id,
          data: {
            inputValue: node.data.inputValue,
            _type: node.data._type as string,
          },
          type: 'element',
        })),
        edges,
      }

      return await modifyIdeaApi(params)

    },
    onSuccess: () => {
      ElNotification({
        title: 'Success',
        message: '修改观点成功',
        type: 'success',
        position: 'bottom-right',
      })
      setVisible(false)
      refreshVueFlow()
    },
    onError: () => {
      ElNotification({
        title: 'Error',
        message: '修改观点失败',
        type: 'error',
        position: 'bottom-right',
      })
    },
  })

  // TODO: 对接后端, 回复观点,同意还是反对.
  function handleSumbit() {
    switch (sumbitStatus.value) {
      case Status.Propose: {
        /**
         * 为 none 就是提出自己的观点
         */
        const [nodes, edges] = [
          argumentFlowRef.value!.getArgumentNodes(),
          argumentFlowRef.value!.getArgumentEdges(),
        ]
        for (const node of nodes) {
          if (!node.data.inputValue) {
            showWarningMsg('请先填写观点内容')
            return
          }
        }
        console.log('reply', reply.value)

        if (reply.value === 'none') {
          const createParams: CreateNewIdeaArgs = {
            topic_id,
            student_id,
            nodes: nodes.map(node => ({
              id: node.id,
              data: {
                inputValue: node.data.inputValue,
                _type: node.data._type as string,
              },
              type: 'element',
            })),
            edges: edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              _type: edge._type,
            })),
          }
          setLoading(true)
          const { run } = useRequest({
            apiFn: async () => await proposeIdeaApi(createParams),
            onSuccess: () => {
              showNotification('论点发布成功', 'success')
              setVisible(false)
              refreshVueFlow()
            },
            onFail: () => {
              showNotification('论点发布失败', 'error')
            },
            onFinally: () => {
              setLoading(false)
            },
          })
          run()
        } else if (reply.value === 'approve' || reply.value === 'reject') {
          const replyParams: ReplyIdeaParams = {
            topic_id,
            student_id,
            replyType: reply.value,
            replyNodeId: +nodeId.value,
            nodes: nodes.map(node => ({
              id: node.id,
              data: {
                inputValue: node.data.inputValue,
                _type: node.data._type as string,
              },
              type: 'element',
            })),
            edges: edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              _type: edge._type,
            })),
          }

          const { run } = useRequest({
            apiFn: async () => await replyIdeaApi(replyParams),
            onSuccess: () => {
              showNotification('回复成功', 'success')
              setVisible(false)
              refreshVueFlow()
            },
            onFail: () => {
              showNotification('回复失败', 'error')
            },
            onFinally: () => {
              setLoading(false)
            },
          })
          run()
        }

        return
      }
      case Status.Check: {
        setVisible(false)
        return
      }
      case Status.Modify: {
        // 用于修改自己的观点
        console.log('修改自己的观点')
        ModifyIdea()
      }
      // case Status.Approve: {
      //   return
      // }
      // case Status.Reject: {
      //   return
      // }
    }
  }

  function handleLayout(direction: LayoutDirection) {
    vueFlowRef.value?.handleLayout(direction)
  }

  /**
   * 判断是否可以编辑
   */
  const canReviseIdea = computed(() => {
    // 如果是自己的话题则可以进行编辑
    return selectStudentId.value === String(student_id)
  })

  // 传递给argumentFlow组件
  const [nodes, setNodes] = useState<NodeType[]>([])
  const [edges, setEdges] = useState<EdgeType[]>([])

  const onArgumentModify = (
    nodesModified: NodeType[],
    edgesModified: EdgeType[]
  ) => {
    // 设置初始状态
    setNodes(nodesModified)
    setEdges(edgesModified)
    refresh() // 直接更新组件
  }

  /**
   * 监听组件状态的变化
   */
  watch(sumbitStatus, newValue => {
    if (newValue === Status.Propose) {
      argumentFlowRef.value?.initState()
    } else if (newValue === Status.Modify) {
      // argumentFlowRef.value.
    }
  })

  return {
    nodes,
    edges,
    onArgumentModify,
    argumentFlowRef,
    vueFlowRef,
    visible,
    sumbitStatus,
    loading,
    setVisible,
    setSumbitStatus,
    setLoading,
    handleIdeaAction,
    handleSumbit,
    handleLayout,
    nodeId,
    key,
    reply,
    setReply,
    refreshVueFlow,
    topicContent,
    canReviseIdea,
  }
}

export { useMyVueFlow }
