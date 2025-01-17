import useRequest from './useRequest.ts'
import Service from '@/apis'
import useState from './useState.ts'
import {Ref} from 'vue'

/**
 * 表单查询钩子
 */
interface Option<T = any, D = any> {
    url: string

    queryParams?: Ref<T>

    onSuccess?(res: Result<D>): void

    onFailure?(): void

    onError?(): void

    onFinally?(): void

    immediate?: boolean

    defaultSort ?:'ASC' | 'DESC'

    debounce?: number

    throttle?: number
}

interface Result<T> {
    list: T[]
    totalNum: number
}

/**
 * 传入的第一个类型为除pageSize和currentPage以外的参数类型
 * 传入的第二个类型为list的元素类型
 * @param props
 * @returns
 */
function useTable<T, D>(props: Option<T>) {
    const {
        url,
        queryParams,
        onSuccess,
        onFailure,
        onError,
        onFinally,
        immediate,
        defaultSort,
        throttle,
        debounce,
    } = props
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sort, setSort] = useState<'DESC' | 'ASC'>(defaultSort?defaultSort:'ASC')
    const data = ref<D[]>([])
    const setData = (list: D[]) => {
        // @ts-ignore
        data.value = list
    }
    const [totalNum, setTotalNum] = useState(0)

    const {loading, run} = useRequest({
        apiFn: async () => {
            return Service({
                method: 'get',
                url: url,
                params: {
                    page: currentPage.value,
                    pageSize: pageSize.value,
                    sort: sort.value,
                    ...queryParams?.value,
                },
            })
        },
        onSuccess(res) {
            setData(res.list)
            setTotalNum(res.totalNum)
            onSuccess && onSuccess(res)
        },
        onFail() {
            ElNotification({
                type: 'error',
                title: '错误',
                message: `获取${url}列表失败`,
            })
            onFailure && onFailure()
        },
        onError() {
            ElNotification({
                type: 'error',
                title: '错误',
                message: `获取${url}列表异常`,
            })
            onError && onError()
        },
        onFinally() {
            onFinally && onFinally()
        },
        immediate: immediate,
        throttle: throttle,
        debounce: debounce,
    })

    watch(currentPage, () => {
        run()
    })

    watch(pageSize, () => {
        run()
    })

    watch(sort, () => {
        run()
    })

    const getData = () => {
        run()
    }

    return {
        data,
        currentPage,
        pageSize,
        sort,
        setSort,
        setCurrentPage,
        setPageSize,
        totalNum,
        loading,
        getData,
    }
}

export default useTable
