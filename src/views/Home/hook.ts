// TODO: 重构index.vue中的代码，将逻辑部分抽离
// 避免组件过长，导致代码混乱
// 总共要实现六个功能,
// 1. 观点接口对接 (发送观点、总结观点、修改观点、支持观点、不支持观点) -- flowApi
// 2. 刷新 -- 路由
// 3. 返回首页 -- 路由
// 4. 设置 -- 布局
// 5. 垂直排列 -- 布局
// 6. 水平排列 -- 布局
import { ref } from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'
import argumentFlowComponent from './components/ArgumentFlowComponent/index.vue'
import useState from '@/hooks/State/useState'
import { EdgeType, Status } from './components/ArgumentFlowComponent/type'
import { ElMessage, ElNotification } from 'element-plus'
import { proposeIdeaApi, queryNodeContentApi } from '@/apis/flow'
import { CreateNewIdeaArgs } from '@/apis/flow/type'
import { LayoutDirection } from '../../components/vueFlow/type'

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

  const [sumbitStatus, setSumbitStatus] = useState<Status>(Status.Propose)

  const [loading, setLoading] = useState(false)

  function handleIdeaAction(action: IdeaAction, payload?: { id: string }) {
    switch (action) {
      case 'propose': {
        /**
         * use the argumentFlowRef to propose idea
         * we should make the dialog visible
         */
        setVisible(true)
        return
      }
      case 'check': {
        /**
         * these codes were used to check the content of idea
         */
        setSumbitStatus(Status.Check)
        /**
         * the nodes' id
         */
        const id = payload?.id
        if (!id) {
          showWarningMsg('请先选择一个节点')
          return
        }
        setVisible(true)

        queryNodeContentApi(+id)
          .then(res => {
            if (res.success) {
              const { nodes, edges } = res.data

              argumentFlowRef.value!.setNodes(
                nodes.map(node => ({
                  ...node,
                  _type: node.data._type,
                }))
              )
              argumentFlowRef.value!.setEdges(edges)
            }
          })
          .catch(err => {
            showNotification(err, 'error')
          })

        return
      }
      case 'reply': {
        return
      }
      case 'revise': {
        return
      }
      case 'support': {
        return
      }
      case 'unsupport': {
        return
      }
    }
  }

  function handleSumbit() {
    switch (sumbitStatus.value) {
      case Status.Propose: {
        /**
         * click button to propose idea
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
        proposeIdeaApi(createParams)
          .then(res => {
            if (res.success) {
              showNotification('论点发布成功', 'success')
              setVisible(false)
            } else {
              showNotification(res.message, 'error')
            }
          })
          .catch(err => {
            showNotification(err.message, 'error')
          })
          .finally(() => {
            setLoading(false)
          })

        return
      }
      case Status.Check: {
        return
      }
      case Status.Approve: {
        return
      }
      case Status.Reject: {
        return
      }
    }
  }

  function handleLayout(direction: LayoutDirection) {
    vueFlowRef.value?.handleLayout(direction)
  }

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
  }
}

export { useMyVueFlow }
