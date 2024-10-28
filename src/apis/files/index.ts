import Service from '@/apis/index.ts'
import {Response} from '@/apis/libcommon'

export interface QueryGroupFileParams {
    page: number;
    pageSize: number;
    sort?: 'ASC' | 'DESC';
    topic_id: number;
    group_id: number;
}

export const queryGroupFilesApi = (queryGroupFileParams: QueryGroupFileParams): Promise<Response> => {
    return Service({
        method: 'get',
        url: '/files/group',
        params:queryGroupFileParams
    })
}