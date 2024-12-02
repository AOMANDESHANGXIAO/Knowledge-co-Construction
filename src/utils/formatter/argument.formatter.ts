import { ArgumentType } from '@/views/Home/components/ArgumentFlowComponent/type'
import { NodeType } from '@/views/Home/components/ArgumentFlowComponent/type'
const argumentTypeChinese = {
  [ArgumentType.Claim]: '论点',
  [ArgumentType.Data]: '论据',
  [ArgumentType.Warrant]: '辩护',
  [ArgumentType.Rebuttal]: '反驳',
  [ArgumentType.Backing]: '支持',
  [ArgumentType.Qualifier]: '限定词',
}
const getArgumentTypeChinese = (argumentElement: ArgumentType) => {
  return argumentTypeChinese[argumentElement]
}
/**
 * 权重
 */
const argumentElementWeightMap = {
  [ArgumentType.Data]: 6,
  [ArgumentType.Warrant]: 5,
  [ArgumentType.Backing]: 4,
  [ArgumentType.Rebuttal]: 3,
  [ArgumentType.Qualifier]: 2,
  [ArgumentType.Claim]: 1,
}
const getArgumentTypeWeight = (argumentElement: ArgumentType) => {
  return argumentElementWeightMap[argumentElement]
}
const getArgumentList = (nodes: NodeType[]) => {
  const res = nodes
    .map(node => {
      return {
        weight: getArgumentTypeWeight(node._type),
        type: getArgumentTypeChinese(node._type),
        text: node.data.inputValue,
      }
    })
    .sort((a, b) => b.weight - a.weight)
    console.log(res)
    return res
}
export { argumentTypeChinese, getArgumentTypeWeight, getArgumentList }
