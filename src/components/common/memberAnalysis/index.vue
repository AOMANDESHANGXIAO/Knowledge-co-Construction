<script setup lang="ts">
import * as echarts from "echarts/core";
import { onMounted } from "vue";

import {
  TooltipComponent,
  TooltipComponentOption,
  LegendComponent,
  LegendComponentOption,
} from "echarts/components";
import { PieChart, PieSeriesOption } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
]);

const props = defineProps({
  chartData: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
});

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption
>;

const chartRef = ref<HTMLElement | null>(null);

const myChart = ref<echarts.ECharts | null>(null);

let option: EChartsOption = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "5%",
    left: "center",
    textStyle: {
      color: "#fff",
    },
  },
  color: ["#91DDCF", "#F7F9F2", "#E8C5E5", "#F19ED2", "#D8EFD3"],
  series: [
    {
      group_name: "来自",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
          color: "#fff",
        },
      },
      labelLine: {
        show: false,
      },
      data: props.chartData,
    },
  ],
};

onMounted(() => {
  myChart.value = echarts.init(chartRef.value!);
  option && myChart.value.setOption(option);
});
</script>

<template>
  <section class="chart-container">
    <div class="member-analysis-container" ref="chartRef"></div>
    <div class="title">{{ props.title }}</div>
  </section>
</template>

<style scoped lang="scss">
.chart-container {
  position: relative;
  width: 350px;
  height: 350px;

  .member-analysis-container {
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }

  .title {
    position: absolute;
    width: 100%;
    //border-top: 1px solid #fff;
    bottom: 0;
    font-size: 24px;
    color: #f9f9f9;
    text-align: center;
  }
}
</style>
