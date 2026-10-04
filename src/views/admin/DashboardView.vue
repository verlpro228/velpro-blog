<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StatChartCard from '@/components/admin/StatChartCard.vue'
import { getDashboardStatsApi } from '@/api/modules/stats'
import { useTheme } from '@/hooks/useTheme'
import type { DashboardStats } from '@/types/stats'
import type { EChartsCoreOption } from 'echarts/core'

const { isDark } = useTheme()

const stats = ref<DashboardStats | null>(null)
const loading = ref(false)

const overviewCards = computed(() => {
  const overview = stats.value?.overview
  return [
    { label: '已发布文档', value: overview?.docCount ?? 0 },
    { label: '草稿箱', value: overview?.draftCount ?? 0 },
    { label: '项目数量', value: overview?.projectCount ?? 0 },
    { label: '总浏览量', value: overview?.totalViews ?? 0 },
    { label: '总点赞数', value: overview?.totalLikes ?? 0 },
  ]
})

const hasTopDocs = computed(() => (stats.value?.topDocs.length ?? 0) > 0)
const hasTags = computed(() => (stats.value?.tagStats.length ?? 0) > 0)

// 横向条形图：y 轴类目自下而上绘制，反转数组让"第一名"显示在最上方
const topDocsOption = computed<EChartsCoreOption | null>(() => {
  const items = [...(stats.value?.topDocs ?? [])].reverse()

  if (!items.length) {
    return null
  }

  return {
    grid: { left: 8, right: 44, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const list = params as Array<{ name: string; value: number; marker: string }>
        const item = list[0]
        return `${item.marker}${item.name}<br/>浏览量：${item.value}`
      },
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { opacity: 0.35 } },
      // ECharts 轴标签有自己的深灰默认色（为浅色底设计），深色下必须显式给浅色
      axisLabel: { color: isDark.value ? '#e2e8f0' : '#475569' },
    },
    yAxis: {
      type: 'category',
      data: items.map((item) => item.title),
      axisLabel: {
        width: 150,
        overflow: 'truncate',
        color: isDark.value ? '#e2e8f0' : '#475569',
      },
    },
    series: [
      {
        type: 'bar',
        data: items.map((item) => item.views),
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 9, 9, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#0891b2' },
              { offset: 1, color: '#22d3ee' },
            ],
          },
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: isDark.value ? '#e2e8f0' : '#475569',
        },
      },
    ],
  }
})

const PIE_PALETTE = ['#0891b2', '#22d3ee', '#0ea5e9', '#6366f1', '#14b8a6', '#8b5cf6', '#f59e0b', '#10b981', '#f472b6', '#94a3b8']

const tagStatsOption = computed<EChartsCoreOption | null>(() => {
  const items = (stats.value?.tagStats ?? []).slice(0, 10)

  if (!items.length) {
    return null
  }

  return {
    tooltip: { trigger: 'item', formatter: '{b}：{c} 篇（{d}%）' },
    legend: {
      bottom: 0,
      type: 'scroll',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: isDark.value ? '#e2e8f0' : '#475569' },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderWidth: 2 },
        // ECharts 6 饼图 label 必须显式给 color：缺失时会走"附加文本"渲染路径，
        // 中文标签在深色底上渲染成"空心+毛边"几乎不可读（全局 textStyle 救不了）
        label: { formatter: '{b} {c}', color: isDark.value ? '#e2e8f0' : '#475569' },
        data: items.map((item, index) => ({
          name: item.name,
          value: item.count,
          itemStyle: { color: PIE_PALETTE[index % PIE_PALETTE.length] },
        })),
      },
    ],
  }
})

const monthlyOption = computed<EChartsCoreOption | null>(() => {
  const items = stats.value?.monthly ?? []

  if (!items.length) {
    return null
  }

  return {
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const list = params as Array<{ name: string; value: number; marker: string }>
        const item = list[0]
        return `${item.marker}${item.name}：发布 ${item.value} 篇`
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: items.map((item) => item.month.slice(5)),
      axisLabel: { interval: 1, color: isDark.value ? '#e2e8f0' : '#475569' },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { opacity: 0.35 } },
      axisLabel: { color: isDark.value ? '#e2e8f0' : '#475569' },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: items.map((item) => item.count),
        lineStyle: { width: 3, color: '#0891b2' },
        itemStyle: { color: '#0891b2' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(8, 145, 178, 0.28)' },
              { offset: 1, color: 'rgba(8, 145, 178, 0.02)' },
            ],
          },
        },
      },
    ],
  }
})

onMounted(async () => {
  loading.value = true

  try {
    stats.value = await getDashboardStatsApi()
  } catch {
    // 拦截器已提示错误，页面保持空态
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="dashboard-shell px-4 py-5 sm:px-8 sm:py-8">
    <div class="mb-8">
      <p class="app-overline text-xs uppercase tracking-[0.32em]">数据看板</p>
      <h1 class="app-heading mt-3 text-2xl font-semibold sm:text-3xl">站点数据总览</h1>
      <p class="app-caption mt-3 text-sm">
        知识库与作品集的整体数据一屏掌握：内容规模、阅读互动与产出节奏。
      </p>
    </div>

    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <template v-if="loading">
        <div class="app-spinner-label col-span-full justify-center py-1">
          <span class="app-spinner app-spinner--lg" aria-hidden="true" />
          <span>数据加载中…</span>
        </div>
        <div v-for="index in 5" :key="index" class="app-card rounded-[1.5rem] px-5 py-4">
          <el-skeleton-item variant="text" style="width: 64px; height: 14px" />
          <el-skeleton-item class="mt-3 block" variant="h3" style="width: 88px; height: 32px" />
        </div>
      </template>

      <div v-for="card in overviewCards" v-else :key="card.label" class="app-card rounded-[1.5rem] px-5 py-4">
        <p class="app-caption text-sm">{{ card.label }}</p>
        <p class="app-heading mt-3 text-3xl font-semibold tabular-nums">{{ card.value.toLocaleString() }}</p>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <StatChartCard title="浏览量 Top 10 文档" :option="topDocsOption" :loading="loading" height="340px" />
      <StatChartCard title="标签分布" :option="tagStatsOption" :loading="loading" height="340px" />
      <StatChartCard
        class="xl:col-span-2"
        title="近 12 个月文档产出"
        :option="monthlyOption"
        :loading="loading"
        height="280px"
      />
    </div>

    <div v-if="!loading && !hasTopDocs" class="app-card mt-4 rounded-[1.5rem] px-5 py-4">
      <p class="app-caption text-sm">还没有已发布文档的浏览数据，发布文章并积累阅读后这里会出现完整图表。</p>
    </div>
  </section>
</template>
