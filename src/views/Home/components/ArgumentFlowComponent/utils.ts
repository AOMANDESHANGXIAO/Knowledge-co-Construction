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
    htmlOutput += `前提: ${premise}<br>`
  }

  // Process warrants
  const warrants = data.edges.filter(edge => edge._type === 'warrant_claim')
  if (warrants.length > 0) {
    htmlOutput += `辩护:<br>`
    warrants.forEach((warrant, _) => {
      htmlOutput += `- ${nodesMap[warrant.source]}<br>`
    })
  }

  // Process backing
  const backings = data.edges.filter(edge => edge._type === 'backing_warrant')
  if (backings.length > 0) {
    htmlOutput += `支撑:<br>`
    backings.forEach((backing, _) => {
      htmlOutput += `- ${nodesMap[backing.source]}<br>`
    })
  }

  // Process qualifier
  const qualifier = data.edges.find(edge => edge._type === 'qualifier_claim')
  if (qualifier) {
    htmlOutput += `限定词: ${nodesMap[qualifier.source]}<br>`
  }

  // Process rebuttal
  const rebuttal = data.edges.find(edge => edge._type === 'rebuttal_claim')
  if (rebuttal) {
    htmlOutput += `反驳: ${nodesMap[rebuttal.source]}<br>`
  }

  // Process conclusion
  const conclusion = nodesMap['claim']
  if (conclusion) {
    htmlOutput += `结论: ${conclusion}<br>`
  }

  return htmlOutput
}

function convertToText(data: { nodes: NodeType[]; edges: EdgeType[] }) {
  const nodesMap: Record<string, string> = {}
  data.nodes.forEach(node => {
    nodesMap[node.id] = node.data.inputValue
  })

  let textOutput = ''

  // Process premise
  const premise = nodesMap['data']
  if (premise) {
    textOutput += `前提: ${premise}<br>`
  }

  // Process warrants
  const warrants = data.edges.filter(edge => edge._type === 'warrant_claim')
  if (warrants.length > 0) {
    textOutput += `辩护:<br>`
    warrants.forEach((warrant, _) => {
      textOutput += `- ${nodesMap[warrant.source]}<br>`
    })
  }

  // Process backing
  const backings = data.edges.filter(edge => edge._type === 'backing_warrant')
  if (backings.length > 0) {
    textOutput += `支撑:<br>`
    backings.forEach((backing, _) => {
      textOutput += `- ${nodesMap[backing.source]}<br>`
    })
  }

  // Process qualifier
  const qualifier = data.edges.find(edge => edge._type === 'qualifier_claim')
  if (qualifier) {
    textOutput += `限定词: ${nodesMap[qualifier.source]}<br>`
  }

  // Process rebuttal
  const rebuttal = data.edges.find(edge => edge._type === 'rebuttal_claim')
  if (rebuttal) {
    textOutput += `反驳: ${nodesMap[rebuttal.source]}<br>`
  }

  // Process conclusion
  const conclusion = nodesMap['claim']
  if (conclusion) {
    textOutput += `结论: ${conclusion}<br>`
  }

  return textOutput
}

export { convertToHTML, convertToText }
