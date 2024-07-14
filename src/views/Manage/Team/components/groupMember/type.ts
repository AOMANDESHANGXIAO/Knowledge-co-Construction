interface Title {
  type: string
  text: string
}

interface Data {
  discussNum?: number
  feedbackNum?: number
  summaryNum?: number
  proposeNum?: number
  [propName: string]: any
}

interface Props {
  name: string
  id: string | number
  title: Title[] // 头衔
  data: Data
}

export type {
  Props,
  Title,
  Data
}