<template>
  <footer class="app-footer border-t">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between md:py-10"
    >
      <div>
        <p class="app-heading text-base font-semibold">Velpro Blog</p>
        <p class="leading-6">面向开发者日常阅读与记录的技术博客系统</p>
      </div>
      <div class="flex flex-col gap-2 md:items-end">
        <p class="leading-6">Vue 3 + TypeScript + Pinia + GSAP + Markdown + Vanta HALO</p>
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
  </footer>
</template>
