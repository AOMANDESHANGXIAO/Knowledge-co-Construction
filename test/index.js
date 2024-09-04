function convertToHTML(data) {
  const nodesMap = {}
  data.nodes.forEach(node => {
    nodesMap[node.id] = node.data.inputValue
  })

  let htmlOutput = ''

  // Process premise
  const premise = nodesMap['data']
  if (premise) {
    htmlOutput += `<div><strong><em>前提</em>:</strong> ${premise}</div>\n`
  }

  // Process backing
  const backings = data.edges.filter(edge => edge._type === 'backing_warrant')
  if (backings.length > 0) {
    htmlOutput += `<div><strong><em>支撑</em>:</strong> ${
      nodesMap[backings[0].source]
    }</div>\n`
  }

  // Process warrants (with backing)
  const warrants = data.edges.filter(edge => edge._type === 'backing_warrant')
  if (warrants.length > 0) {
    htmlOutput += `<div><strong><em>辩护</em> a:</strong><ul>\n`
    warrants.forEach((warrant, index) => {
      htmlOutput += `<li>${nodesMap[warrant.target]}</li>\n`
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
    htmlOutput += `<div><strong><em>结论</em>:</strong><br><strong><div>${conclusion}</div></div>\n`
  }

  return htmlOutput
}

// Example usage:
const data = {
  nodes: [
    { id: 'data', data: { inputValue: '锻炼是适度的', _type: 'data' } },
    { id: 'claim', data: { inputValue: '锻炼对身体很有好处', _type: 'claim' } },
    {
      id: '1725419387290_0',
      data: {
        inputValue:
          '因为锻炼可以帮我们舒缓心情，加强体内的新陈代谢，还可以锻炼肌肉。因此，锻炼对于身体是有好处的。',
        _type: 'warrant',
      },
    },
    {
      id: '1725419440220_2',
      data: { inputValue: '科学研究说明锻炼对于身体很好', _type: 'backing' },
    },
    {
      id: '1725419487269_6',
      data: { inputValue: '大多数情况下', _type: 'qualifier' },
    },
    {
      id: '1725419515905_8',
      data: {
        inputValue: '如果你的身体不便于运动，那么锻炼对于身体可能就是有害的',
        _type: 'rebuttal',
      },
    },
  ],
  edges: [
    {
      id: 'init-data-claim',
      source: 'data',
      target: '1725419487269_6',
      _type: 'data_claim',
    },
    {
      id: '1725419387290_1',
      source: '1725419387290_0',
      target: '1725419487269_6',
      _type: 'warrant_claim',
    },
    {
      id: '1725419440220_3',
      source: '1725419440220_2',
      target: '1725419387290_0',
      _type: 'backing_warrant',
    },
    {
      id: '1725419487269_7',
      source: '1725419487269_6',
      target: '1725419515905_8',
      _type: 'qualifier_claim',
    },
    {
      id: '1725419515905_9',
      source: '1725419515905_8',
      target: 'claim',
      _type: 'rebuttal_claim',
    },
  ],
}

console.log(convertToHTML(data))
