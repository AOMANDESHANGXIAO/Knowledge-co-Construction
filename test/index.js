/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-15 11:52:43
 * @Description  : diff数组的更新情况
 */
function diffArr(oldArr, newArr) {
  // 比较数组的id就可以了，遍历一边旧的数组，找到使用了哪些id
  const oldMap = new Map()

  oldArr.forEach(el => {
    oldMap.set(el.id, el)
  })

  // 遍历新数组
  const newEls = []
  newArr.forEach(el => {
    // 如果新数组中有旧数组中没有的节点，就是新增的节点
    if (!oldMap.has(el.id)) {
      newEls.push(el)
    }
  })

  return newEls
}

/**
 *
 * @param {string} id 学生id
 * @param {Array} nodes node表
 * @param {Array} addEdges 新增的边表
 */
function getNotification(id, nodes, addEdges) {
  // nodes
  const selfNodeMap = new Map()

  nodes.forEach(el => {
    if (el.data.student_id === id) {
      selfNodeMap.set(el.id, el)
    }
  })

  const notes = []
  // 遍历一边addEdges表
  addEdges.forEach(el => {
    // 如果target指向学生自己的节点，则是被回复了
    if (!selfNodeMap.has(el.target)) {
      notes.push(el)
    }
  })

  return notes
}

const oldNodes = [
  {
    id: '3',
    type: 'idea',
    data: {
      name: '斌',
      id: 3,
      bgc: '#FF7F3E',
      student_id: 4,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: '6',
    type: 'idea',
    data: {
      name: '斌',
      id: 6,
      bgc: '#FF7F3E',
      student_id: 4,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
]

const newNodes = [
  {
    id: '3',
    type: 'idea',
    data: {
      name: '斌',
      id: 3,
      bgc: '#FF7F3E',
      student_id: 4,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: '6',
    type: 'idea',
    data: {
      name: '斌',
      id: 6,
      bgc: '#FF7F3E',
      student_id: 4,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: '9',
    type: 'idea',
    data: {
      name: '管理员一号',
      id: 9,
      bgc: '#FF7F3E',
      student_id: 7,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: '10',
    type: 'idea',
    data: {
      name: '1333',
      id: 10,
      bgc: '#FF7F3E',
      student_id: 9,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: '11',
    type: 'idea',
    data: {
      name: '1333',
      id: 11,
      bgc: '#FF7F3E',
      student_id: 9,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
]

const oldEdges = [
  {
    id: '1',
    source: '2',
    target: '1',
    _type: 'group_to_discuss',
    animated: true,
  },
  {
    id: '2',
    source: '3',
    target: '2',
    _type: 'idea_to_group',
    animated: true,
  },
]

const newEdges = [
  {
    id: '1',
    source: '2',
    target: '1',
    _type: 'group_to_discuss',
    animated: true,
  },
  {
    id: '2',
    source: '3',
    target: '2',
    _type: 'idea_to_group',
    animated: true,
  },
  {
    id: '3',
    source: '6',
    target: '2',
    _type: 'idea_to_group',
    animated: true,
  },
  {
    id: '6',
    source: '9',
    target: '2',
    _type: 'idea_to_group',
    animated: true,
  },
]

console.log('These are the new nodes', diffArr(oldNodes, newNodes))
console.log('These are the new edges', diffArr(oldEdges, newEdges))
