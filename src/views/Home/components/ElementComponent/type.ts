import { ArgumentType } from '../ArgumentFlowComponent/type'

/**
 * @deprecated
 */
export enum ElementType {
  Backing = 'Backing',
  Warrant = 'Warrant',
  Claim = 'Claim',
  Qualifier = 'Qualifier',
  Rebuttal = 'Rebuttal',
  Data = 'Data',
}

export interface Tag {
  name: string
  type: string
}

export interface Props {
  nodeId?: string
  modelValue: string
  visible: boolean
  _type: ArgumentType
  argumentGuideType: 'propose' | 'agree' | 'disagree' | 'summary'
  tags?: Tag[]
}
