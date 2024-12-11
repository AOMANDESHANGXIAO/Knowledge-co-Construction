// src/api/viewpoint.api.ts
import Service, { Response } from '../index'
import {
  GetViewPointListArgs,
  CreateTopicArgs,
  CreateIdeaArgs,
  CreateAgreeArgs,
  CreateDisAgreeArgs,
  CreateAskArgs,
  CreateResponseArgs,
  GetTopicArgs,
  GetContentArgs,
  GetViewPointListResponse,
  GetTopicResponse,
  GetResponseResponse,
  GetAskResponse,
  GetAgreeResponse,
  GetDisagreeResponse,
  GetIdeaResponse,
  GetGroupResponse,
  UpdateIdeaArgs,
  UpdateDisAgreeArgs,
  UpdateAgreeArgs,
  UpdateGroupArgs,
  UpdateAskArgs,
  UpdateResponseArgs,
} from './interface'

const BASE_ROUTER = '/viewpoint'

class ViewPointAPI {
  static getViewPointList(
    params: GetViewPointListArgs
  ): Response<GetViewPointListResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/list`,
      params,
    })
  }

  static createTopic(data: CreateTopicArgs): Response<any> {
    return Service({
      method: 'post',
      url: `${BASE_ROUTER}/topic`,
      data,
    })
  }

  static createIdea(data: CreateIdeaArgs): Response<any> {
    return Service({
      method: 'post',
      url: `${BASE_ROUTER}/idea`,
      data,
    })
  }

  static createAgree(data: CreateAgreeArgs): Response<any> {
    return Service({
      method: 'post',
      url: `${BASE_ROUTER}/agree`,
      data,
    })
  }

  static createDisAgree(data: CreateDisAgreeArgs): Response<any> {
    return Service({
      method: 'post',
      url: `${BASE_ROUTER}/disagree`,
      data,
    })
  }

  static createAsk(data: CreateAskArgs): Response<any> {
    return Service({
      method: 'post',
      url: `${BASE_ROUTER}/ask`,
      data,
    })
  }

  static createResponse(data: CreateResponseArgs): Response<any> {
    return Service({
      method: 'post',
      url: `${BASE_ROUTER}/response`,
      data,
    })
  }

  static getTopic(params: GetTopicArgs): Response<GetTopicResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/topic`,
      params,
    })
  }

  static getGroup(params: GetContentArgs): Response<GetGroupResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/group`,
      params,
    })
  }

  static getIdea(params: GetContentArgs): Response<GetIdeaResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/idea`,
      params,
    })
  }

  static getAgree(params: GetContentArgs): Response<GetAgreeResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/agree`,
      params,
    })
  }

  static getDisAgree(params: GetContentArgs): Response<GetDisagreeResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/disagree`,
      params,
    })
  }

  static getAsk(params: GetContentArgs): Response<GetAskResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/ask`,
      params,
    })
  }

  static getResponse(params: GetContentArgs): Response<GetResponseResponse> {
    return Service({
      method: 'get',
      url: `${BASE_ROUTER}/response`,
      params,
    })
  }
  static updateIdea(args: UpdateIdeaArgs): Response<{
    id: string
  }> {
    return Service({
      method: 'patch',
      url: `${BASE_ROUTER}/idea`,
      data: args,
    })
  }
  static updateDisAgree(args: UpdateDisAgreeArgs): Response<{
    id: string
  }> {
    return Service({
      method: 'patch',
      url: `${BASE_ROUTER}/disagree`,
      data: args,
    })
  }
  static updateAgree(args: UpdateAgreeArgs): Response<{
    id: string
  }> {
    return Service({
      method: 'patch',
      url: `${BASE_ROUTER}/agree`,
      data: args,
    })
  }
  static updateGroup(args: UpdateGroupArgs): Response<{
    id: string
  }> {
    return Service({
      method: 'patch',
      url: `${BASE_ROUTER}/group`,
      data: args,
    })
  }
  static updateAsk(args: UpdateAskArgs): Response<{
    id: string
  }> {
    return Service({
      method: 'patch',
      url: `${BASE_ROUTER}/ask`,
      data: args,
    })
  }
  static updateResponse(args: UpdateResponseArgs): Response<{
    id: string
  }> {
    return Service({
      method: 'patch',
      url: `${BASE_ROUTER}/response`,
      data: args,
    })
  }
}

export default ViewPointAPI
