<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/hooks/useAuth'

interface LoginFormState {
  username: string
  password: string
}

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const { login, loading } = useAuth()

const formState = reactive<LoginFormState>({
  username: '',
  password: '',
})

const rules: FormRules<LoginFormState> = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/editor',
)

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  try {
    await login({
      username: formState.username,
      password: formState.password,
    })

    await router.push(redirectTarget.value)
  } catch {
    ElMessage.error('账号或密码错误')
  }
}
</script>

<template>
  <div class="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.2),_transparent_22%)]"
    />

    <div class="grid w-full max-w-6xl gap-6 sm:gap-10 lg:grid-cols-[1fr_460px]">
      <div class="app-panel hidden rounded-[2rem] p-10 backdrop-blur lg:block">
        <p class="app-overline text-xs uppercase tracking-[0.32em]">后台入口</p>
        <h1 class="app-heading mt-6 text-5xl font-semibold">知识库后台管理系统</h1>
        <p class="app-copy mt-6 max-w-xl text-lg leading-8">
          这里是博客系统的核心管理后台。登录后可进行文档发布、内容维护与系统配置等操作，帮助你更高效地管理整个站点内容。
        </p>

        <div class="mt-10 grid gap-4 md:grid-cols-3">
          <div class="app-card-strong rounded-2xl p-4">
            <p class="app-caption text-sm">访问方式</p>
            <p class="app-heading mt-2 text-lg font-semibold">登录验证</p>
          </div>
          <div class="app-card-strong rounded-2xl p-4">
            <p class="app-caption text-sm">权限范围</p>
            <p class="app-heading mt-2 text-lg font-semibold">内容管理</p>
          </div>
          <div class="app-card-strong rounded-2xl p-4">
            <p class="app-caption text-sm">直达工作台</p>
            <p class="app-heading mt-2 text-sm font-semibold">/admin/editor</p>
          </div>
        </div>
      </div>

      <div class="app-panel-strong rounded-[2rem] p-6 shadow-2xl backdrop-blur sm:p-8">
        <div class="mb-8">
          <p class="app-overline text-xs uppercase tracking-[0.32em]">欢迎回来</p>
          <h2 class="app-heading mt-3 text-2xl font-semibold sm:text-3xl">登录系统</h2>
          <p class="app-caption mt-2 text-sm">登录后将跳转至：{{ redirectTarget }}</p>
        </div>

        <el-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="账号" prop="username">
            <el-input v-model="formState.username" placeholder="请输入账号" size="large" />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formState.password"
              placeholder="请输入密码"
              show-password
              size="large"
            />
          </el-form-item>

          <el-button class="mt-4 !h-12 !w-full" type="primary" :loading="loading" @click="handleSubmit">
            登录并进入后台
          </el-button>

          <RouterLink class="app-text-link mt-4 inline-flex text-sm" to="/">
            返回首页
          </RouterLink>
        </el-form>
      </div>
    </div>
  </div>
</template>
