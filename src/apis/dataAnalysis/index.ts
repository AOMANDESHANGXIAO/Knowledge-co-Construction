import Service, { Response } from '../index'

const BASE_URL = '/data-analysis'
export interface SeriesDataItem {
  name: string
}

export interface LinksItem {
  source: number | string
  target: number | string
  symbolSize?: number[]
  label?: {
    show: boolean
  }
  lineStyle?: {
    width: number
  }
}

export interface GetGroupInteractionResponse {
  seriesData: SeriesDataItem[]
  links: LinksItem[]
}

export class DataAnalysisAPI {
  static getGroupInteractionData(params: {
    topic_id: string
    group_id: string
  }): Response<GetGroupInteractionResponse> {
    return Service({
      method: 'get',
      url: `${BASE_URL}/interact`,
      params,
    })
  }
}
