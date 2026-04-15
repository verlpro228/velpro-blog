import { ref } from 'vue'

export function useRequest<TArgs extends unknown[], TResult>(
  requestHandler: (...args: TArgs) => Promise<TResult>,
) {
  const loading = ref(false)
  const error = ref<string>('')

  const run = async (...args: TArgs) => {
    loading.value = true
    error.value = ''

    try {
      return await requestHandler(...args)
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '请求失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    run,
  }
}
