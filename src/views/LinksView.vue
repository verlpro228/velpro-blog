<script setup lang="ts">
import { FRIEND_LINKS, FRIEND_LINK_REQUIREMENTS } from '@/constants/links'
</script>

<template>
  <div class="links-page px-3 pb-16 sm:px-6 sm:pb-20">
    <div class="mx-auto max-w-screen-xl">
      <section
        class="links-hero mb-6 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8"
      >
        <p class="app-overline text-xs uppercase tracking-[0.32em]">友情链接</p>
        <h1 class="links-hero-title mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.8rem]">
          一路上的其他站点
        </h1>
        <p class="links-hero-copy mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          收录朋友们的博客与技术站点。想交换友链的话，看下面的申请方式，期待与你互相链接。
        </p>
      </section>

      <div v-if="FRIEND_LINKS.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="link in FRIEND_LINKS"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="links-card group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-center gap-3">
            <span class="links-card-avatar flex h-11 w-11 flex-none items-center justify-center rounded-2xl text-base font-bold text-white">
              {{ link.name.slice(0, 1).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <p class="links-card-name truncate text-sm font-semibold text-slate-900">{{ link.name }}</p>
              <p class="links-card-url truncate text-xs text-slate-400">{{ link.url }}</p>
            </div>
          </div>
          <p class="links-card-desc mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{{ link.description }}</p>
        </a>
      </div>

      <section class="links-apply mt-6 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8">
        <h2 class="links-apply-title text-lg font-semibold text-slate-900">申请友链</h2>
        <ul class="links-apply-list mt-4 space-y-2.5">
          <li v-for="(requirement, index) in FRIEND_LINK_REQUIREMENTS" :key="index" class="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <span class="links-apply-index mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-semibold">
              {{ index + 1 }}
            </span>
            <span>{{ requirement }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
