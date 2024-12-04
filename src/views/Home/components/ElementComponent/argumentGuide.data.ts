const ToulminGuideWords = {
  data: {
    // 前提
    propose: ['论证的前提是', 'XX是XX', '我认为XX是事实'], // 提出
    agree: [
      '该论证XX部分是正确的',
      '我同意该论点的XX部分',
      '论证的前提是',
      '我认为XX是事实',
    ], // 同意
    disagree: [
      '该论证XX部分是不正确的',
      '我不同意该论点的XX部分',
      '论证的前提是',
      '我认为XX是事实',
    ], // 不同意
    summary: ['我们小组结论的前提是XX', 'XX是XX', '我们认为XX是事实'], // 总结(小组)
  },
  warrant: {
    // 辩护
    propose: [
      '因为XX,所以XX',
      '由于XX,故而XX',
      'XX成立则XX必然成立',
      'XX成立则XX可能成立',
    ],
    agree: [
      '该论点XX成立,因为XX',
      '我同意该论点,因为XX',
      '由于XX,故而XX',
      'XX成立则XX必然成立',
      'XX成立则XX可能成立',
      '我虽然同意该论点,但其也有局限性。因为XX',
    ],
    disagree: [
      '该论点XX不成立,因为XX',
      '我不同意该论点,因为XX',
      '由于XX,故而XX',
      'XX成立则XX必然成立',
      'XX成立则XX可能成立',
    ],
    summary: [
      '因为XX,所以XX',
      '由于XX,故而XX',
      'XX成立则XX必然成立',
      'XX成立则XX可能成立',
    ],
  },
  backing: {
    // 支撑
    propose: [
      '学术论文证实了这一点,例如',
      '举个例子',
      '生活经验得出',
      'XXX说过',
      'XX书籍可以证实',
    ],
    agree: [
      '学术论文证实了这一点,例如',
      '举个例子',
      '生活经验得出',
      'XXX说过',
      'XX书籍可以证实',
    ],
    disagree: [
      '学术论文证实了这一点,例如',
      '举个例子',
      '生活经验得出',
      'XXX说过',
      'XX书籍可以证实',
    ],
    summary: [
      '学术论文证实了这一点,例如',
      '举个例子',
      '生活经验得出',
      'XXX说过',
      'XX书籍可以证实',
    ],
  },
  rebuttal: {
    // 反驳
    propose: ['我反对', '我不认同'],
    agree: ['我认为他的xxx观点有道理，因为xxx', '我认同他的xxx观点，因为xxx'],
    disagree: ['我反对他的xxx观点，因为xxx', '我不认同他的xxx观点，因为xxx'],
    summary: [
      '我认为我应当修改我的结论',
      '我依旧认同我的结论',
      '我认同xxx，但我不认同xxx',
    ],
  },
  qualifier: {
    // 限定词
    propose: ['除非', '在xxx情况下', '只有XXX情况才成立'],
    agree: ['除非', '在xxx情况下', '只有XXX情况才成立'],
    disagree: ['除非', '在xxx情况下', '只有XXX情况才成立'],
    summary: ['除非', '在xxx情况下', '只有XXX情况才成立'],
  },
  claim: {
    // 结论
    propose: ['我认为', '我的结论是XX', 'XX一定是成立的'],
    agree: ['我同意XX的观点', '我赞成XX的部分观点'],
    disagree: ['我反对xxx', 'XX的观点具有局限性', '我认为xxx应当改成'],
    summary: [
      '我认为',
      '总而言之',
      '结合大家的观点,我们认为',
      '我们的结论是XX',
      'XX一定是成立的',
    ],
  },
}

export default ToulminGuideWords
