<script lang="ts" setup>
// import { VueUiWordCloudDatasetItem } from 'vue-data-ui'
import _ from 'lodash'
// import { VueUiWordCloud } from 'vue-data-ui'
import MyWordCloudUI from '@/components/common/MyWordCloudUI/index.vue'
import { DataAnalysisAPI } from '@/apis/dataAnalysis'
import useRequest from '@/hooks/Async/useRequest'
import useQueryParam from '@/hooks/router/useQueryParam'
defineOptions({
  name: 'index',
})
const SHOW_WORD_COUNT = 15
type WordCloudDataSetItem = {
  name: string
  value: number
}
const generateWordCloudList = (text: string): WordCloudDataSetItem[] => {
  const list: WordCloudDataSetItem[] = []
  const segmenter: {
    segment: string
    index: number
    input: string
    isWordLike: Boolean
  }[] = Array.from(
    // @ts-ignore
    new Intl.Segmenter('cn', { granularity: 'word' }).segment(text)
  )
  const wordCounts = _.countBy(
    segmenter.filter(item => item.segment.length > 1),
    'segment'
  )

  for (const key in wordCounts) {
    list.push({
      name: key,
      value: wordCounts[key],
    })
  }
  return _.orderBy(list, ['value'], ['desc']).slice(0, SHOW_WORD_COUNT)
}
// const text =
// '我好难过，感觉自己想要死掉。不想死，但是又想活下去。我好难过，感觉自己想要死掉。不想死，但是又想活下去。我好难过，感觉自己想要死掉。不想死，但是又想活下去。我好难过，感觉自己想要死掉。不想死，但是又想活下去。我好难过，感觉自己想要死掉。不想死，但是又想活下去。'
// const dataset = computed(() => {
//   const res = generateWordCloudList(text)
//   console.log('word==>', res)
//   return [
//     {
//       name: '相似',
//       value: 10,
//     },
//   ]
// })
// const dataset = ref(generateWordCloudList(text))
// const testDataSet = ref([
//   {
//     name: '相似',
//     value: 10,
//   },
// ])
const topic_id = useQueryParam('topic_id')
const list = ref<
  {
    group_name: string
    text: string
  }[]
>([])
useRequest({
  apiFn: async () => {
    return DataAnalysisAPI.getGroupWord({
      topic_id: topic_id.value,
    })
  },
  onSuccess(data: {
    list: Array<{
      group_name: string
      text: string
    }>
  }) {
    list.value = data.list
  },
  immediate: true,
})

// const serious = ref({
//   series: [
//     {
//       data: generateWordCloudList(text),
//     },
//   ],
// })
</script>

<template>
  <div class="word-cloud-layout">
    <div v-for="(item, index) in list">
      <n-h3 prefix="bar" type="info" style="margin-bottom: 5px">{{
        item.group_name
      }}</n-h3>
      <div class="container">
        <MyWordCloudUI
          :options="{
            series: [
              {
                data: generateWordCloudList(item.text),
              },
            ],
          }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.word-cloud-layout {
  width: 100%;
  height: 100%;
  // background-color: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background-color: var(--light-bgc-white);
  overflow: auto;
  padding: 10px;
  .container {
    position: relative;
    width: 300px;
    height: 300px;
    border: 1px solid #ccc;
    background: #fff;
  }
}
</style>
