<template>
  <footer class="app-footer border-t">
    <div
      class="mx-auto flex max-w-screen-xl flex-col gap-3 px-3 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between md:py-10 2xl:max-w-screen-2xl"
    >
      <div>
        <p class="app-heading text-base font-semibold">Velpro Blog</p>
        <p class="leading-6">面向开发者日常阅读与记录的技术博客系统</p>
      </div>
      <div class="flex flex-col gap-2 md:items-end">
        <p class="leading-6">Vue 3 + TypeScript + Pinia + GSAP + Three.js + Markdown</p>
        <div class="flex items-center gap-4">
          <a
            class="app-footer-rss inline-flex items-center gap-1.5 text-xs leading-5 transition hover:opacity-80"
            href="/links"
            title="友情链接"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>友情链接</span>
          </a>
          <a
            class="app-footer-rss inline-flex items-center gap-1.5 text-xs leading-5 transition hover:opacity-80"
            href="/api/rss.xml"
            target="_blank"
            rel="noopener"
            title="RSS 订阅"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
            <span>RSS 订阅</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
