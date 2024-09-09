/**
 * 自动聚焦
 */
const handler = (el: HTMLElement) => {
  const textarea = el.querySelector('textarea')
  if (textarea) {
    textarea.focus()
  } else {
    console.warn('These is no textarea in this element')
  }
}

const focusElInput = {
  updated: (el: HTMLElement) => {
    handler(el)
  },
}

export default focusElInput
