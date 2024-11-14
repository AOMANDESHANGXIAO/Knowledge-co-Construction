interface Scaffold {
  title: string
  description: string
  getPrompt: (...args: any[]) => string
  ShowInQuickPrompt: boolean
  key: 'argumentation' | 'defense' | 'limitation' | 'evidence'
  validate: (...args: any[]) => boolean
}

export default function useScaffold() {
  // 给ChatGpt的提示词支架
  const scaffolds = ref<Scaffold[]>([
    {
      title: '论证框架',
      description: '梳理整个论证框架。',
      key: 'argumentation',
      getPrompt: (topic: string) => {
        return `请你帮我梳理一下论证框架,给出论证的基础、结论、论据以及论证的局限之处。\
        请用中文回答。这是我正在论证的话题：${topic}`
      },
      ShowInQuickPrompt: true,
      validate: (...args: any[]) => {
        return true
      },
    },
    {
      title: '辩护审查',
      description: '审查论证的辩护。',
      key: 'defense',
      getPrompt: (currentArgument: string) => {
        return `请你帮我审查一下论证的辩护，请用中文回答。这是我目前的论证：${currentArgument}`
      },
      ShowInQuickPrompt: true,
      validate: (...args: any[]) => {
        return true
      },
    },
    {
      title: '局限检验',
      description: '分析论证的局限性。',
      key: 'limitation',
      getPrompt: (currentArgument: string) => {
        return `请你帮我分析一下论证的局限性，请用中文回答。这是我目前的论证：${currentArgument}`
      },
      ShowInQuickPrompt: true,
      validate: (...args: any[]) => {
        return true
      },
    },
    {
      title: '证据审查',
      description: '审查论证的证据。',
      key: 'evidence',
      getPrompt: (currentArgument: string) => {
        return `请你帮我审查一下论证的证据，请用中文回答。这是我目前的论证：${currentArgument}`
      },
      ShowInQuickPrompt: true,
      validate: (...args: any[]) => {
        return true
      },
    },
  ])

  const setValidate = (
    key: Scaffold['key'],
    validate: (...args: any[]) => boolean
  ) => {
    const scaffold = scaffolds.value.find(item => item.key === key)
    if (scaffold) {
      scaffold.validate = validate
    }
  }

  return {
    scaffolds,
    setValidate,
  }
}
