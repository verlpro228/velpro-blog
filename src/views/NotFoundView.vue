<template>
  <div class="app-shell flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p class="app-overline text-xs uppercase tracking-[0.32em]">404</p>
    <h1 class="app-heading mt-4 text-5xl font-semibold">页面不存在</h1>
    <p class="app-copy mt-4 max-w-xl text-base leading-7">
      你访问的页面已被移动或暂未创建，可以先回到首页继续浏览这个博客系统。
    </p>
    <RouterLink class="app-button-primary mt-8 px-6 py-3 text-sm" to="/">
      返回首页
    </RouterLink>
  </div>
</template>
