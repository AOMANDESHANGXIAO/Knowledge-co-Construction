// 绘图的默认options

export const graphOptions = {
    width: 800,
    height:800,
    background: {
        color: '#fff'
    },
    grid: {
        size: 10,
        visible: true,
        color: '#ccc'
    },
    scroller: {
        enabled: true,
        pannable: true,
        pageVisible: true,
        pageBreak: false,
    },
    mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
    },
}