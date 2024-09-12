/**
 * 用于评价论证元素、互动、和团队的情况
 */
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  RadarSeriesOption,
  GraphSeriesOption,
} from 'echarts/charts'
import { ComputedRef, Ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import _ from 'lodash'

interface RadarSeriesOptionType extends RadarSeriesOption {
  title?: {
    text: string
  }
  radar?: {
    indicator: {
      name: string
      max: number
    }[]
  }
  series?: {
    name: string
    type: 'radar'
    data: {
      value: number[]
      name: string
    }[]
  }
}

interface GraphSeriesOptionType extends GraphSeriesOption {
  title?: {
    text: string
  }
  series: {
    data: {
      name: string
    }[]
    links: {
      source: string
      target: string
      lineStyle: {
        width: number
      }
    }[]
  }[]
  barOption: {
    series: {
      name: string
      type: 'bar'
      stack: 'total'
      label: {
        show: boolean
      }
      emphasis: {
        focus: 'series'
      }
      data: number[]
    }
  }
}

interface BarSeriesOptionType extends BarSeriesOption {
  xAxis: {
    data: string[]
  }
  series: {
    name: string
    type: 'bar'
    stack: 'total'
    label: {
      show: boolean
    }
    emphasis: {
      focus: 'series'
    }
    data: number[]
  }[]
}

interface EvaludationData {
  argumentData: RadarSeriesOptionType
  interactionData: GraphSeriesOptionType
  groupData: BarSeriesOptionType
}

function useEvaluation(
  props: ComputedRef<EvaludationData> | Ref<EvaludationData>
) {
  const GREAT_ARGUMENT_RATE = 0.7
  const WARNING_ARGUMENT_RATE = 0.5
  const ARGUMENT_ELMENTS = ['支撑', '结论', '前提', '限定词', '反驳', '辩护']

  const getArguSequence = () => {
    const { argumentData } = props.value
    return argumentData.radar!.indicator.map(item => item.name)
  }

  const getArgumentMaxCount = () => {
    const { argumentData } = props.value
    return argumentData.radar!.indicator[0].max
  }

  // TODO: 完善评价指标
  // 目前的评价机制:
  // 当学生的论证元素占比超过其结论和前提的占比的 70% 时，评价该元素解构优秀
  // 当学生的论证元素占比超过其结论和前提的占比的 50% 时，评价该元素解构良好
  // 否则评价该元素解构不佳
  const formatArgumentElement = (
    argumentData: typeof props.value.argumentData
  ) => {
    const sequence = getArguSequence()
    const data = argumentData.series!.data[0].value
    const maxCount = getArgumentMaxCount()
    return ARGUMENT_ELMENTS.map(item => {
      if (data[sequence.indexOf(item)] / maxCount >= GREAT_ARGUMENT_RATE) {
        return {
          type: 'excellent',
          element: item,
        }
      } else if (
        data[sequence.indexOf(item)] / maxCount >=
        WARNING_ARGUMENT_RATE
      ) {
        return {
          type: 'warning',
          element: item,
        }
      } else {
        return {
          type: 'danger',
          element: item,
        }
      }
    })
  }

  const titleMap = {
    success: '表现优异!',
    warning: '你可以做的更好!',
    error: '需要加把劲!',
  }

  const loadingHandler = () => {
    let _type: 'success' | 'warning' | 'error' = 'success'
    if (
      Object.keys(props.value.argumentData).length === 0 ||
      Object.keys(props.value.interactionData).length === 0 ||
      Object.keys(props.value.groupData).length === 0
    ) {
      return {
        flag: false,
        alert: {
          title: '加载中',
          type: _type,
          suggestions: [],
        },
      }
    }
    return {
      flag: true,
    }
  }

  /**
   * 评价论证元素
   */
  const evaluatedArgument = computed(() => {
    const { argumentData } = props.value
    let _type: 'success' | 'warning' | 'error' = 'success'
    const res = loadingHandler()
    if (!res.flag) {
      return res.alert
    }

    const evaluations = formatArgumentElement(argumentData)
    let warningCount = 0
    let dangerCount = 0
    const suggestions = evaluations
      .map(evaluation => {
        if (evaluation.type === 'warning') {
          warningCount++
          return `你的论证加上${evaluation.element}会更加完善哦!`
        } else if (evaluation.type === 'danger') {
          dangerCount++
          return `你的大部分论证都缺乏了${evaluation.element}!建议补充哦!`
        } else {
          return ''
        }
      })
      .filter(item => item)

    if (warningCount === 0 && dangerCount === 0) {
      _type = 'success'
    } else if (warningCount > dangerCount) {
      _type = 'warning'
    } else {
      _type = 'error'
    }

    return {
      title: titleMap[_type],
      suggestions,
      type: _type,
    }
  })

  const { getOneUserInfo } = useUserStore()

  const formatInteractionElement = (
    interactionData: typeof props.value.interactionData
  ) => {
    // 查找学生个人是否与其他所有小组成员进行了互动
    const studentName = getOneUserInfo('nickname')
    const links = interactionData.series![0].links
    // 标记学生是否与其他人互动了
    const isInteracted = links.find(item => {
      return (
        (item.source === studentName || item.target === studentName) &&
        item.source !== item.target &&
        item.lineStyle.width > 0
      )
    })
    // 标记是否有学生没有互动过
    const noEngageStudents = links
      .filter(item => {
        return item.lineStyle.width === 0
      })
      .map(item => item.target)
    // 找到学生与哪些成员的互动较少
    const maxInteractionWidth = _.maxBy(links, 'lineStyle.width')?.lineStyle
      .width

    const leastEngageStudents = links
      .filter(item => item.lineStyle.width < (maxInteractionWidth || 0) / 2)
      .map(item => item.target)

    return {
      isInteracted,
      noEngageStudents: [...new Set(noEngageStudents)],
      leastEngageStudents: [...new Set(leastEngageStudents)],
    }
  }

  /**
   * 评价互动
   */
  const evaluatedInteraction = computed(() => {
    const { interactionData } = props.value
    let _type: 'success' | 'warning' | 'error' = 'success'
    const res = loadingHandler()
    if (!res.flag) {
      return res.alert
    }
    const { isInteracted, noEngageStudents, leastEngageStudents } =
      formatInteractionElement(interactionData)

    const suggestions = []

    /**
     * 学生未与其他成员互动
     */
    if (isInteracted) {
      suggestions.push('多多与其他成员互动哦!')
    }

    /**
     * 组里有学生未互动, 提醒学生去互动
     */
    if (noEngageStudents.length > 0) {
      noEngageStudents.forEach(item => {
        suggestions.push(`学生${item}没有互动哦!快于他互动吧!`)
      })
    }

    /**
     * 有学生的互动较少
     */
    if (leastEngageStudents.length > 0) {
      leastEngageStudents.forEach(item => {
        if (noEngageStudents.includes(item)) return
        suggestions.push(`学生${item}的互动较少哦!请多多互动吧!`)
      })
    }

    if (suggestions.length === 0) {
      _type = 'success'
    } else if (suggestions.length < 3) {
      _type = 'warning'
    } else {
      _type = 'error'
    }

    return {
      title: titleMap[_type],
      suggestions,
      type: _type,
    }
  })

  function getRanking(
    data: { name: string; data: number[] }[],
    behaviorIndex: number
  ): { name: string; rank: number }[] {
    return data
      .sort((a, b) => b.data[behaviorIndex] - a.data[behaviorIndex])
      .map((student, index) => ({
        name: student.name,
        rank: index + 1,
      }))
  }

  function getStudentRankings(
    studentsData: { name: string; data: number[] }[],
    studentName: string
  ): (number | null)[] {
    const rankings = []
    for (let i = 0; i < studentsData[0].data.length; i++) {
      const ranking = getRanking(studentsData, i)
      const studentRank =
        ranking.find(student => student.name === studentName)?.rank || null
      rankings.push(studentRank)
    }
    return rankings
  }

  const formatGroupContribution = () => {
    const { groupData } = props.value
    const contrubutionMap = {
      propose: '提出',
      modify: '修改',
      approve: '支持',
      reject: '反对',
    }
    const sequence = groupData.xAxis.data
    const barSeries = groupData.series
    const nickname = getOneUserInfo('nickname') as string
    const studentData = barSeries.find(item => item.name === nickname)
    const studentRankings = getStudentRankings(barSeries, nickname)
    const totalStudents = barSeries.length

    const suggestions: string[] = []

    // 遍历每个贡献类型
    sequence.forEach((contributionType, index) => {
      const ranking = studentRankings[index]
      if (ranking === totalStudents || ranking === totalStudents - 1) {
        suggestions.push(
          `你在${
            contrubutionMap[contributionType as keyof typeof contrubutionMap]
          }方面的排名较低，请积极参与相关活动！`
        )
      }
    })
    // 找到本组的一个平均数
    const average = barSeries.reduce((a, b) => a + b.data[0], 0) / totalStudents
    // 遍历学生的数据
    studentData!.data.forEach((count, index) => {
      if (count < average) {
        suggestions.push(
          `你在本组中的${sequence[index]}表现不佳，请积极参与学习活动！`
        )
      }
    })

    return {
      rankings: studentRankings,
      suggestions,
    }
  }

  /**
   * 评价小组贡献
   */
  const evaluatedGroupContribution = computed(() => {
    let _type: 'success' | 'warning' | 'error' = 'success'
    const res = loadingHandler()
    if (!res.flag) {
      return res.alert
    }

    const { suggestions, rankings } = formatGroupContribution()
    console.log('rankings', rankings)
    console.log('suggestions', suggestions)

    if (suggestions.length === 0) {
      _type = 'success'
    } else if (suggestions.length < 3) {
      _type = 'warning'
    } else {
      _type = 'error'
    }

    return {
      title: titleMap[_type],
      suggestions,
      type: _type,
    }
  })

  return { evaluatedArgument, evaluatedInteraction, evaluatedGroupContribution }
}
export default useEvaluation
