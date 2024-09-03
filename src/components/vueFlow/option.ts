/**
 * The options of the vue flow component
 */
import { useCssVar } from '@vueuse/core'

const GENERIC_LINE_COLOR = useCssVar('--normal-line-color').value
const APPROVE_LINE_COLOR = useCssVar('--approve-line-color').value
const REJECT_LINE_COLOR = useCssVar('--reject-line-color').value

const EDGE_COLORS = {
  group_to_discuss: GENERIC_LINE_COLOR,
  idea_to_group: GENERIC_LINE_COLOR,
  approve: APPROVE_LINE_COLOR,
  reject: REJECT_LINE_COLOR,
  default: '#fff',
}

export { EDGE_COLORS }
