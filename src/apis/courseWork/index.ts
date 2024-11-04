import Service from '@/apis/index'
import {Response} from '@/apis/libcommon'

type PromiseResponse<T = any> = Promise<Response<T>>

export interface AddCourseWorkInput {
    topic_id: number
    content: string
}

const BASE_URL = '/coursework'
export default class CourseWorkAPI {
    static async findOne(id: number): PromiseResponse<{ courseWork: string }> {
        return Service({
            method: 'get',
            url: `${BASE_URL}/content`,
            params: {
                topic_id: id,
            },
        })
    }

    static async findCourseWorkUpload({topic_id, student_id}: {
        topic_id: number,
        student_id: number
    }): PromiseResponse<{
        "id": number,
        "student_id": number,
        "topic_id": number,
        "upload_time": string,
        "file_path": string,
        "file_name": string
    }> {
        return Service({
            method: 'get',
            url: `${BASE_URL}/uploaded`,
            params: {
                topic_id,
                student_id,
            },
        })
    }
}
