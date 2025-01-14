<template>
  <div>
    <div id="word_cloud_view_id" style="width: 500px; height: 250px"></div>
  </div>
</template>
<script lang="ts">
import * as echarts from 'echarts'
import 'echarts-wordcloud'
export default {
  name: 'word_cloud_index',
  data(): {
    word_cloud_view: any
    word_cloud_options: any
    word_list: any
  } {
    return {
      word_cloud_view: null,
      word_cloud_options: {},
      word_list: [
        {
          name: '十九大精神',
          id: '123',
          value: 15000,
        },
        {
          name: '两学一做',
          id: '123',
          value: 10081,
        },
        {
          name: '中华民族',
          id: '123',
          value: 9386,
        },
        {
          name: '马克思主义',
          id: '123',
          value: 7500,
        },
        {
          name: '民族复兴',
          id: '123',
          value: 7500,
        },
        {
          name: '社会主义制度',
          id: '123',
          value: 6500,
        },
        {
          name: '国防白皮书',
          id: '123',
          value: 6500,
        },
        {
          name: '创新',
          id: '123',
          value: 6000,
        },
        {
          name: '民主革命',
          id: '123',
          value: 4500,
        },
        {
          name: '文化强国',
          id: '123',
          value: 3800,
        },
        {
          name: '国家主权',
          id: '123',
          value: 3000,
        },
        {
          name: '武装颠覆',
          id: '123',
          value: 2500,
        },
        {
          name: '领土完整',
          id: '123',
          value: 2300,
        },
        {
          name: '安全',
          id: '123',
          value: 2000,
        },
        {
          name: '从严治党',
          id: '123',
          value: 1900,
        },
        {
          name: '现代化经济体系',
          id: '123',
          value: 1800,
        },
        {
          name: '国防动员',
          id: '123',
          value: 1700,
        },
        {
          name: '信息化战争',
          id: '123',
          value: 1600,
        },
        {
          name: '局部战争',
          id: '123',
          value: 1500,
        },
        {
          name: '教育',
          id: '123',
          value: 1200,
        },
        {
          name: '职业教育',
          id: '123',
          value: 1100,
        },
        {
          name: '兵法',
          id: '123',
          value: 900,
        },
        {
          name: '一国两制',
          id: '123',
          value: 800,
        },
        {
          name: '特色社会主义思想',
          id: '123',
          value: 700,
        },
      ],
    }
  },
  mounted() {
    this.draw_word_cloud_view()
    this.init_view_data()
  },
  methods: {
    // 初始化控件
    draw_word_cloud_view() {
      if (this.word_cloud_view) {
        this.word_cloud_view.dispose()
      }
      this.word_cloud_view =
        document.getElementById('word_cloud_view_id') &&
        echarts.init(document.getElementById('word_cloud_view_id'))
      this.word_cloud_view &&
        this.word_cloud_view.setOption(this.word_cloud_options)
    },
    // 初始化参数
    init_view_data() {
      let word_cloud_series = [
        {
          type: 'WordCloud',
          shape: 'circle',
          left: 'center',
          clickable: true,
          top: 'center',
          width: '100%',
          height: '100%',
          right: null,
          bottom: null,
          sizeRange: [12, 50], // 字号范围
          rotationRange: [0, 0], // 云中文字的角度
          rotationStep: 0, // 渲染的梯度
          gridSize: 50, // 词的间距
          drawOutOfBound: false, // 是否允许词云在边界外渲染
          layoutAnimation: true,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: () => {
              return (
                'rgb(' +
                [
                  Math.round(Math.random() * 255),
                  Math.round(Math.random() * 255),
                  Math.round(Math.random() * 255),
                ].join(',') +
                ')'
              )
            },
          },
          // 鼠标进入样式
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 5,
              shadowColor: '#F5F5F5',
            },
          },
          data: this.word_list, // 数据
        },
      ]
      this.word_cloud_options = {
        series: word_cloud_series,
      }
      // 设置参数
      this.word_cloud_view.setOption(this.word_cloud_options)
      // 绑定点击事件
      this.word_cloud_view.on('click', (params: any) => {
        this.getItemInfo(params.data.id)
      })
    },
    // 点击词云项
    getItemInfo(id: string) {
      console.log('---', id)
    },
  },
}
</script>
<style scoped>
div {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
