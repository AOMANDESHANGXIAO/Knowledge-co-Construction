import { NodeType, EdgeType } from './type'

function convertToHTML(data: { nodes: NodeType[]; edges: EdgeType[] }) {
  const nodesMap: Record<string, string> = {}
  data.nodes.forEach(node => {
    nodesMap[node.id] = node.data.inputValue
  })

  let htmlOutput = ''

  // Process premise
  const premise = nodesMap['data']
  if (premise) {
    htmlOutput += `<div><strong>前提:</strong> ${premise}</div>\n`
  }

  // Process warrants
  const warrants = data.edges.filter(edge => edge._type === 'warrant_claim')
  if (warrants.length > 0) {
    htmlOutput += `<div><strong><em>辩护</em>:</strong><ul>\n`
    warrants.forEach((warrant, _) => {
      htmlOutput += `<li>${nodesMap[warrant.source]}</li>\n`
    })
    htmlOutput += `</ul></div>\n`
  }

  // Process backing
  const backings = data.edges.filter(edge => edge._type === 'backing_warrant')
  if (backings.length > 0) {
    htmlOutput += `<div><strong><em>支撑</em>:</strong><ul>\n`
    backings.forEach((backing, _) => {
      htmlOutput += `<li>${nodesMap[backing.source]}</li>\n`
    })
    htmlOutput += `</ul></div>\n`
  }

  // Process qualifier
  const qualifier = data.edges.find(edge => edge._type === 'qualifier_claim')
  if (qualifier) {
    htmlOutput += `<div><strong><em>限定词</em>:</strong> ${
      nodesMap[qualifier.source]
    }</div>\n`
  }

  // Process rebuttal
  const rebuttal = data.edges.find(edge => edge._type === 'rebuttal_claim')
  if (rebuttal) {
    htmlOutput += `<div><strong><em>反驳</em>:</strong> ${
      nodesMap[rebuttal.source]
    }</div>\n`
  }

  // Process conclusion
  const conclusion = nodesMap['claim']
  if (conclusion) {
    htmlOutput += `<div><strong>结论:</strong><div>${conclusion}</div></div>\n`
  }

  return htmlOutput
}

export { convertToHTML }
