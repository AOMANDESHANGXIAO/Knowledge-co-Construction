import { ArgumentType } from "./type";

const DEFAULT_ARGUMENT_STATE = {
  nodes: [
    {
      id: 'data', // 初始化时前提和结论的id是定死的
      type: 'element',
      position: { x: 0, y: 0 },
      _type: ArgumentType.Data,
      data: {
        inputValue: '',
        _type: ArgumentType.Data,
      },
    },
    {
      id: 'claim',
      type: 'element',
      position: { x: 0, y: 0 },
      _type: ArgumentType.Claim,
      data: {
        inputValue: '',
        _type: ArgumentType.Claim,
      },
    },
  ],
  edges: [
    {
      id: 'init-data-claim',
      source: 'data',
      target: 'claim',
      _type: `${ArgumentType.Data}_${ArgumentType.Claim}`,
    },
  ],
}

export default DEFAULT_ARGUMENT_STATE