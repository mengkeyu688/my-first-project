<!-- 商品分类柱状图组件 -->
<template>
  <article class="chart-card">
    <div class="chart-title">{{ title }}</div>
    <div ref="chartRef" class="chart"></div>
  </article>
</template>

<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type {
  ComposeOption,
  ECharts,
} from 'echarts/core'
import type {
  GridComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { BarSeriesOption } from 'echarts/charts'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

type BarChartOption = ComposeOption<
  GridComponentOption | TooltipComponentOption | BarSeriesOption
>

interface ChartClickPayload {
  chart: 'bar'
  params: unknown
}

withDefaults(defineProps<{
  title?: string
}>(), {
  title: '商品分类统计',
})

const emit = defineEmits<{
  'chart-click': [payload: ChartClickPayload]
}>()

echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
])

const chartRef = ref<HTMLDivElement | null>(null)
const chart = ref<ECharts | null>(null)
let resizeObserver: ResizeObserver | null = null

const chartOption: BarChartOption = {
  color: ['#13bce8'],
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    top: 36,
    right: 24,
    bottom: 28,
    left: 42,
  },
  xAxis: {
    type: 'category',
    data: ['服饰', '数码', '家居', '食品', '美妆'],
    axisLine: {
      lineStyle: {
        color: '#dfe6ef',
      },
    },
    axisLabel: {
      color: '#606266',
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#606266',
    },
    splitLine: {
      lineStyle: {
        color: '#edf2f7',
      },
    },
  },
  series: [
    {
      name: '商品数量',
      type: 'bar',
      barWidth: 28,
      data: [42, 36, 28, 51, 22],
    },
  ],
}

const resizeChart = () => {
  chart.value?.resize()
}

const initChart = () => {
  if (!chartRef.value) {
    return
  }

  chart.value = echarts.init(chartRef.value)
  chart.value.setOption(chartOption)
  chart.value.on('click', (params) => {
    emit('chart-click', {
      chart: 'bar',
      params,
    })
  })
}

onMounted(async () => {
  await nextTick()
  initChart()
  resizeChart()

  resizeObserver = new ResizeObserver(resizeChart)

  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }

  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  resizeObserver?.disconnect()
  chart.value?.dispose()
})
</script>

<style scoped>
.chart-card {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(37, 57, 83, 0.18);
}

.chart-title {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #303133;
  font-size: 20px;
  border-bottom: 1px solid #e7edf4;
}

.chart {
  width: 100%;
  height: calc(100% - 48px);
  min-height: 0;
}
</style>
