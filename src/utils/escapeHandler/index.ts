// 处理数据转义的函数
function escapeData(data: any) {
  if (typeof data === 'object') {
    for (let key in data) {
      if (typeof data[key] === 'string') {
        data[key] = escapeString(data[key])
      } else if (typeof data[key] === 'object') {
        data[key] = escapeData(data[key])
      }
    }
  }
  return data
}

// 转义字符串中特殊字符的函数
function escapeString(str :string) {
  return str.replace(/['"`]/g, match => {
    switch (match) {
      case "'":
        return "\\'"
      case '"':
        return '\\"'
      case '`':
        return '\\`'
      default:
        return match
    }
  })
}

export {
  escapeData,
  escapeString
}