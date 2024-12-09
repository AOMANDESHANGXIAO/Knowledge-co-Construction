/**
 * The options of the vue flow component
 */
import { useCssVar } from '@vueuse/core'

const agree = useCssVar('--agree-line-color').value
const disagree = useCssVar('--disagree-line-color').value
const ask = useCssVar('--ask-line-color').value
const response = useCssVar('--response-line-color').value
const idea = useCssVar('--idea-line-color').value
const group = useCssVar('--group-line-color').value

const EDGE_COLORS = {
  agree,
  disagree,
  ask,
  response,
  idea,
  group,
  topic: '#fff',
}

export { EDGE_COLORS }
