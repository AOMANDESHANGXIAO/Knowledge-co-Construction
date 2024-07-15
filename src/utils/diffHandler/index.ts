/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-15 11:52:43
 * @Description  : diff数组的更新情况
 */
interface El {
  id: string
  [propName: string]: any
}

function diffArr(oldArr: El[], newArr: El[]): El[] {
  console.log('oldArr', oldArr)
  console.log('newArr', newArr)
  const oldMap = new Map()

  oldArr.forEach(el => {
    oldMap.set(el.id, el)
  })

  const newEls: El[] = []
  newArr.forEach(el => {
    if (!oldMap.has(el.id)) {
      newEls.push(el)
    }
  })

  return newEls
}

interface Node {
  id: string
  data: {
    student_id?: string
    [propName: string]: any
  }
  [propName: string]: any
}

interface Edge {
  id: string
  source: string
  target: string
  [propName: string]: any
}

function getNotification(id: string, nodes: Node[], addEdges: Edge[]): Edge[] {
  // nodes
  const selfNodeMap = new Map()

  nodes.forEach(el => {
    if (el.data?.student_id && el.data.student_id === id) {
      selfNodeMap.set(el.id, el)
    }
  })

  const notes: Edge[] = []
  // 遍历一边addEdges表
  addEdges.forEach(el => {
    // 如果target指向学生自己的节点，则是被回复了
    if (!selfNodeMap.has(el.target)) {
      notes.push(el)
    }
  })

  return notes
}

export { diffArr, getNotification }
