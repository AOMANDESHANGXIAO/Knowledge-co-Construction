import Service from '@/apis/index.ts'
import {Response} from '@/apis/libcommon'
import {UploadInput,UploadCourseWorkInput} from './type.ts'

export const uploadFilesApi = (uploadInput: UploadInput,files: FileList): Promise<Response> => {
    const formData = new FormData()
    formData.append('student_id', uploadInput.student_id.toString())
    formData.append('is_public', uploadInput.is_public.toString())
    formData.append('topic_id', uploadInput.topic_id.toString())

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
    }

    return Service.post('/upload/addFiles', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export const uploadCourseWorkApi = (uploadInput:UploadCourseWorkInput,file:File) => {
    const formData = new FormData()

    formData.append('topic_id', uploadInput.topic_id.toString())
    formData.append('student_id', uploadInput.student_id.toString())
    formData.append('file', file)

    return Service.post('/upload/addCourseWorkFile', formData, {
        headers: {
            'Content-Type':'multipart/form-data',
        },
    })
}