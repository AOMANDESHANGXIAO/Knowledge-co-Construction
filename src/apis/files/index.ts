import Service,{BASE_URL} from '@/apis/index.ts'
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
        params: queryGroupFileParams
    })
}

export const downloadFileApi = (fileInfo:{
    filepath: string;
    filename: string;
}) => {
    const {filepath, filename} = fileInfo
    // 获取token
    const user = localStorage.getItem('userInfo')
    if(user === null) throw new Error('userInfo is null')
    const token = JSON.parse(user).token
    // 使用fetch API发送请求
    fetch(BASE_URL + `/files/export/${filepath}`,{
        headers:{
            'Authorization': token
        }
    }) // 替换为实际的文件名
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            // 创建一个URL对象来表示下载的文件
            const url = window.URL.createObjectURL(blob);
            // 创建一个a标签来模拟下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // 替换为实际的文件名
            document.body.appendChild(a);
            a.click();
            // 下载完成后，释放URL对象
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
