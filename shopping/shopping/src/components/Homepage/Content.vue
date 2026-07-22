<!-- 主题内容区域组件 -->
<template>
  <section class="chart-section">
    <LineChart @chart-click="emitChartClick" />
    <BarChart @chart-click="emitChartClick" />
  </section>
</template>

<script setup lang="ts">
import LineChart from './LineChart.vue'
import BarChart from './BarChart.vue'

type ChartName = 'line' | 'bar'

interface ChartClickPayload {
  chart: ChartName
  params: unknown
}

const emit = defineEmits<{
  'chart-click': [payload: ChartClickPayload]
}>()

const emitChartClick = (payload: ChartClickPayload) => {
  emit('chart-click', payload)
}
</script>

<style scoped>
.chart-section {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
</style>
