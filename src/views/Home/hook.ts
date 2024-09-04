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
import { proposeIdeaApi, replyIdeaApi } from '@/apis/flow'
import { CreateNewIdeaArgs, ReplyIdeaParams } from '@/apis/flow/type'
import { LayoutDirection } from '../../components/vueFlow/type'
import useRequest from '@/hooks/Async/useRequest'
import useRefresh from '../../hooks/Element/useRefresh'

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

  const [reply, setReply] = useState<'none' | 'reject' | 'approve'>('none')

  const { key, refresh } = useRefresh()

  const refreshVueFlow = () => {
    console.log('refreshVueFlow')
    vueFlowRef.value?.refreshData()
  }

  /**
   *
   * @param action
   * @param payload {id: string} id为node的Id
   * @returns
   */
  function handleIdeaAction(action: IdeaAction, payload?: { id: string }) {
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
        console.log('check 1')
        setSumbitStatus(Status.Check)
        const id = payload?.id
        console.log('check 2')
        if (!id) {
          showWarningMsg('请先选择一个节点')
          return
        }
        setVisible(true)
        setNodeId(id)
        setReply('none')
        refresh()
        return
      }
    }
  }

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
   * 监听组件状态的变化
   */
  watch(sumbitStatus, newValue => {
    if (newValue === Status.Propose) {
      argumentFlowRef.value?.initState()
    }
  })

  return {
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
    refreshVueFlow
  }
}

export { useMyVueFlow }
