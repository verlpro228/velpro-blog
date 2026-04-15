export function getLocalStorage<T>(key: string, fallback: T): T {
  const rawValue = localStorage.getItem(key)

  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

export function setLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeLocalStorage(key: string) {
  localStorage.removeItem(key)
}
