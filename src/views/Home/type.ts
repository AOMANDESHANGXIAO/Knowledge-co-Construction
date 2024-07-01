enum Action {
  proposal,
  oppose,
  approve,
  summary,
  revise,
}

export interface FormListItem {
  title: string
  placeholder: string
  model: string
}

export interface ProposeIdeaModelType {
  option: string
  basedOption: string
  limitation : string
}

export interface ApproveIdeaModelType {
  agreeOption: string
  limitation: string
  basedOption: string
}

export interface OpposeIdeaModelType {
  disagreeOption: string
  myOption: string
  basedOption: string
}

export interface SummaryIdeaModelType {
  summary: string
}

export interface ReviseSelfFormModelType {
  limitation: string
  basedOption: string
  newOption: string
}

export { Action }
