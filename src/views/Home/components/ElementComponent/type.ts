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
  type: ElementType
}

export interface Props {
  nodeId?: string
  modelValue: string
  _type: string
  tags?: Tag[]
}
