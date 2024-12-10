import { THEME_COLOR, GREEN, RED, PURPLE, YELLOW } from '@/config'
import { InteractionNodeType } from '@/apis/viewpoint/interface'
const options: Record<
  InteractionNodeType,
  {
    title: string
    inputValues: {
      title: string
      key: string
      value: string
      placeholder: string
      tags: string[]
      setter(value: string): void
    }[]
    arrow: {
      text: string
      color: string
    }
  }
> = {
  idea: {
    title: '发布观点',
    inputValues: [
      {
        title: '结论',
        key: 'idea_conclusion',
        value: '',
        placeholder: '你的主要观点是什么?',
        tags: ['词条1', '词条2'],
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '理由',
        key: 'idea_reason',
        value: '',
        placeholder: '你这么说有什么理由?',
        tags: ['词条1', '词条2'],
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '局限性',
        key: 'idea_limitation',
        value: '',
        placeholder: '你这么说有什么局限性?',
        tags: ['词条1', '词条2'],
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
        placeholder: '你的主要观点是什么?',
        tags: ['词条1', '词条2'],
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '原因',
        key: 'agree_reason',
        value: '',
        placeholder: '你为什么同意?',
        tags: ['词条1', '词条2'],
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '改进的点',
        key: 'agree_supplement',
        value: '',
        placeholder: '该观点还可以怎么改进?',
        tags: ['词条1', '词条2'],
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
        tags: ['词条1', '词条2'],
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '原因',
        key: 'disagree_reason',
        value: '',
        placeholder: '你为什么不同意?',
        tags: ['词条1', '词条2'],
        setter(value: string) {
          this.value = value
        },
      },
      {
        title: '意见',
        key: 'disagree_suggestion',
        value: '',
        placeholder: '你认为该如何修改?',
        tags: ['词条1', '词条2'],
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
        tags: ['词条1', '词条2'],
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
        tags: ['词条1', '词条2'],
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
}

export { options }
