export interface Scaffold {
  title: string
  description: string
  getPrompt: (...args: any[]) => string
  ShowInQuickPrompt: boolean
  key: string
  validate: (...args: any[]) => boolean
  onValidateError: () => void
}