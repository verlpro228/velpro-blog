<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getProfileApi, updatePasswordApi, updateProfileApi } from '@/api/modules/auth'
import { useUserStore } from '@/store/modules/user'

interface ProfileFormState {
  name: string
  tagline: string
}

interface PasswordFormState {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const userStore = useUserStore()
const router = useRouter()

const profileFormRef = ref<FormInstance>()
const profileSaving = ref(false)
const profileForm = reactive<ProfileFormState>({
  name: '',
  tagline: '',
})

const profileRules: FormRules<ProfileFormState> = {
  name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

const syncProfileForm = () => {
  profileForm.name = userStore.profile?.name ?? ''
  profileForm.tagline = userStore.profile?.tagline ?? ''
}

// 初始资料拉取状态：未加载完前表单区显示旋转遮罩，避免空白表单显得死板
const profileLoading = ref(false)

onMounted(async () => {
  profileLoading.value = true

  try {
    const profile = await getProfileApi()
    userStore.setProfile(profile)
  } catch {
    // http 拦截器已提示，沿用本地缓存资料
  }

  syncProfileForm()
  profileLoading.value = false
})

const handleSaveProfile = async () => {
  const valid = await profileFormRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  profileSaving.value = true

  try {
    const profile = await updateProfileApi({ ...profileForm })
    userStore.setProfile(profile)
    ElMessage.success('个人信息已更新')
  } catch {
    // http 拦截器已提示
  } finally {
    profileSaving.value = false
  }
}

const passwordFormRef = ref<FormInstance>()
const passwordSaving = ref(false)
const passwordForm = reactive<PasswordFormState>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules: FormRules<PasswordFormState> = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 128, message: '新密码长度需在 6-128 位之间', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const handleUpdatePassword = async () => {
  const valid = await passwordFormRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  passwordSaving.value = true

  try {
    await updatePasswordApi({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })

    ElMessage.success('密码已更新，请重新登录')
    userStore.clearSession()
    await router.push('/login')
  } catch {
    // http 拦截器已提示（原密码错误等）
  } finally {
    passwordSaving.value = false
  }
}
</script>

<template>
  <div v-loading="profileLoading" class="grid gap-6 p-4 sm:p-8 xl:grid-cols-2">
    <section class="app-panel rounded-[2rem] p-6 sm:p-8">
      <p class="app-overline text-xs uppercase tracking-[0.28em]">个人信息</p>
      <h2 class="app-heading mt-2 text-xl font-semibold">资料设置</h2>
      <p class="app-caption mt-2 text-sm">展示在后台侧边栏与站点中的个人资料</p>

      <el-form
        ref="profileFormRef"
        class="mt-8"
        :model="profileForm"
        :rules="profileRules"
        label-position="top"
        @submit.prevent="handleSaveProfile"
      >
        <el-form-item label="昵称" prop="name">
          <el-input v-model="profileForm.name" placeholder="请输入昵称" size="large" />
        </el-form-item>

        <el-form-item label="签名" prop="tagline">
          <el-input v-model="profileForm.tagline" placeholder="例如：Frontend Engineer" size="large" />
        </el-form-item>

        <el-button
          class="mt-2 !h-11"
          type="primary"
          :loading="profileSaving"
          @click="handleSaveProfile"
        >
          保存个人信息
        </el-button>
      </el-form>
    </section>

    <section class="app-panel rounded-[2rem] p-6 sm:p-8">
      <p class="app-overline text-xs uppercase tracking-[0.28em]">账号安全</p>
      <h2 class="app-heading mt-2 text-xl font-semibold">修改密码</h2>
      <p class="app-caption mt-2 text-sm">更新密码后需要重新登录</p>

      <el-form
        ref="passwordFormRef"
        class="mt-8"
        :model="passwordForm"
        :rules="passwordRules"
        label-position="top"
        @submit.prevent="handleUpdatePassword"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            placeholder="请输入原密码"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            placeholder="至少 6 位"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            placeholder="再次输入新密码"
            show-password
            size="large"
          />
        </el-form-item>

        <el-button
          class="mt-2 !h-11"
          type="primary"
          :loading="passwordSaving"
          @click="handleUpdatePassword"
        >
          更新密码
        </el-button>
      </el-form>
    </section>
  </div>
</template>
