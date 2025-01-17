import { THEME_COLOR, GREEN, RED, PURPLE, YELLOW } from '@/config'
import { InteractionNodeType } from '@/apis/viewpoint/interface'
type InputValue = {
  title: string
  key: string
  value: string
  placeholder: string
  tags: string[]
  required: boolean
  setter(value: string): void
}
type Option = {
  title: string
  inputValues: InputValue[]
  arrow: {
    text: string
    color: string
  }
}
type OptionRecord = Record<InteractionNodeType, Option>
const ChineseOptions = {
  idea: '观点',
  agree: '同意',
  disagree: '不同意',
  ask: '困惑',
  response: '回应',
  group: '小组观点',
}
const getReviseOptions = (
  type: InteractionNodeType,
  inputValues: InputValue[]
): Option => {
  return {
    title: `修改${ChineseOptions[type]}`,
    inputValues,
    arrow: {
      text: '修改',
      color: THEME_COLOR,
    },
  }
}
const getGroupReviseOptions = (inputValues: InputValue[]): Option => {
  return {
    title: '修改小组观点',
    inputValues,
    arrow: {
      text: '修改',
      color: THEME_COLOR,
    },
  }
}
const options: OptionRecord = {
  idea: {
    title: '发布观点',
    inputValues: [
      {
        title: '结论',
        key: 'idea_conclusion',
        value: '',
        placeholder: '你的主要观点是什么?',
        tags: ['我认为XXX'],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '理由',
        key: 'idea_reason',
        value: '',
        placeholder: '你这么说有什么理由?',
        tags: [
          '因为XXX,所以XXX',
          '有新闻表明XXX',
          '就我自己的经历表明XXX',
          '有人/书说过XXX',
        ],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '局限性',
        key: 'idea_limitation',
        value: '',
        placeholder: '你这么说有什么局限性?',
        tags: ['当XXX情况下不成立', '只有XXX情况下', '除非XXX'],
        required: false,
        setter(value: string) {
          this.value = value
        },
      },
    ],
    arrow: {
      text: '发布',
      color: THEME_COLOR,
    },
  },
  agree: {
    title: '同意观点',
    inputValues: [
      {
        title: '同意的点',
        key: 'agree_viewpoint',
        value: '',
        placeholder: '你支持哪一点?',
        tags: ['我支持这位同学说的XXX', 'XXX让我最赞同'],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '原因',
        key: 'agree_reason',
        value: '',
        placeholder: '你为什么同意?',
        tags: [
          '因为XXX,所以XXX',
          '有新闻表明XXX',
          '就我自己的经历表明XXX',
          '有人/书说过XXX',
        ],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '有没有补充的',
        key: 'agree_supplement',
        value: '',
        placeholder: '该观点还可以怎么改进?',
        tags: [
          '这个观点让我想到了XXX',
          '这个观点说的情况可以延伸到',
          '我认为在XXX场景下可以XXX',
        ],
        required: false,
        setter(value: string) {
          this.value = value
        },
      },
    ],
    arrow: {
      text: '同意',
      color: GREEN,
    },
  },
  disagree: {
    title: '不同意观点',
    inputValues: [
      {
        title: '不同意的点',
        key: 'disagree_viewpoint',
        value: '',
        placeholder: '你不同意哪一点?',
        tags: ['我反对XXX部分'],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '原因',
        key: 'disagree_reason',
        value: '',
        placeholder: '你为什么不同意?',
        tags: [
          '不一定XXX就XXX',
          '在XXX情况下不一定成立',
          '我以前的经历表明XXX',
          '有研究表明XXX',
          '我看过一本书,书上说XXX',
        ],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '意见',
        key: 'disagree_suggestion',
        value: '',
        placeholder: '你认为该如何修改?',
        tags: ['我认为这句话应该修改成XXX'],
        required: false,
        setter(value: string) {
          this.value = value
        },
      },
    ],
    arrow: {
      text: '反对',
      color: RED,
    },
  },
  ask: {
    title: '困惑',
    inputValues: [
      {
        title: '困惑的点',
        key: 'ask_question',
        value: '',
        placeholder: '对于对方的观点你最困惑的是?',
        tags: [
          '我不太理解你说的XXX',
          '为什么说XXX',
          '在XXX情况下难道不可以吗?',
        ],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
    ],
    arrow: {
      text: '感到困惑',
      color: YELLOW,
    },
  },
  response: {
    title: '回应',
    inputValues: [
      {
        title: '回应',
        key: 'response_content',
        value: '',
        placeholder: '你的回复是什么?',
        tags: ['我的意思是XXX', '我确实没有考虑到XXX,我会修改观点'],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
    ],
    arrow: {
      text: '回应',
      color: PURPLE,
    },
  },
  group: {
    title: '总结小组观点',
    inputValues: [
      {
        title: '结论',
        key: 'idea_conclusion',
        value: '',
        placeholder: '你的主要观点是什么?',
        tags: ['我认为XXX'],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '理由',
        key: 'idea_reason',
        value: '',
        placeholder: '你这么说有什么理由?',
        tags: [
          '因为XXX,所以XXX',
          '有新闻表明XXX',
          '就我自己的经历表明XXX',
          '有人/书说过XXX',
        ],
        required: true,
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '局限性',
        key: 'idea_limitation',
        value: '',
        placeholder: '你这么说有什么局限性?',
        tags: ['当XXX情况下不成立', '只有XXX情况下', '除非XXX'],
        required: false,
        setter(value: string) {
          this.value = value
        },
      },
    ],
    arrow: {
      text: '发布',
      color: THEME_COLOR,
    },
  },
}
const resetOptions = () => {
  options.idea.inputValues.forEach(item => {
    item.value = ''
  })
}
export { options, resetOptions, getReviseOptions, getGroupReviseOptions }
