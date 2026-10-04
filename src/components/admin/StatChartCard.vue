<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import { useTheme } from '@/hooks/useTheme'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
])

const props = defineProps<{
  title: string
  option: EChartsCoreOption | null
  loading?: boolean
  height?: string
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const { isDark } = useTheme()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function textColor() {
  // 深色下必须用不透明浅色：半透明 rgba 会让 ECharts 6 饼图部分标签渲染成
  // "空心+描边"的毛边效果（深色底上几乎不可读），浅色下用原 slate-600
  return isDark.value ? '#e2e8f0' : '#475569'
}

function render() {
  if (!chartRef.value || !props.option) {
    return
  }

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  chart.setOption(
    {
      textStyle: { color: textColor() },
      ...props.option,
    },
    { notMerge: true },
  )
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  render()

  resizeObserver = new ResizeObserver(handleResize)
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
})

watch(
  () => props.option,
  () => render(),
)

watch(isDark, () => {
  render()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="stat-chart-card app-card rounded-[1.5rem] p-4 sm:p-5">
    <div class="flex items-center justify-between gap-3">
      <p class="app-heading text-sm font-semibold sm:text-base">{{ title }}</p>
      <el-skeleton-item v-if="loading" style="width: 72px; height: 14px" variant="text" />
    </div>

    <div
      v-show="option && !loading"
      ref="chartRef"
      class="stat-chart-body mt-3 w-full"
      :style="{ height: height ?? '300px' }"
    />

    <!-- 加载中：旋转指示器占位，保持图表区域高度不塌陷 -->
    <div
      v-if="loading"
      class="app-spinner-label justify-center"
      :style="{ height: height ?? '300px' }"
    >
      <span class="app-spinner app-spinner--lg" aria-hidden="true" />
      <span>图表加载中…</span>
    </div>

    <div v-if="!loading && !option" class="flex items-center justify-center text-sm text-slate-400" :style="{ height: height ?? '300px' }">
      暂无数据
    </div>
  </div>
</template>
