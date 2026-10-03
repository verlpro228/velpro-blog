<script setup lang="ts">
import DocComments from '@/components/knowledge/DocComments.vue'
</script>

<template>
  <div class="guestbook-page px-3 pb-16 sm:px-6 sm:pb-20">
    <div class="mx-auto max-w-screen-xl">
      <section class="guestbook-hero mb-6 px-4 sm:px-6">
        <p class="app-overline text-xs uppercase tracking-[0.32em]">留言板</p>
        <h1 class="guestbook-title mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.8rem]">
          来坐坐，说点什么
        </h1>
        <p class="guestbook-copy mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          对站点、文章或项目的任何想法都欢迎留在这里：提问、建议、吐槽或是打个招呼。
          评论基于 GitHub Discussions，使用 GitHub 账号登录后即可发言。
        </p>
      </section>

      <section class="guestbook-card rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8">
        <DocComments doc-id="guestbook" term="guestbook" />
      </section>
    </div>
  </div>
</template>
