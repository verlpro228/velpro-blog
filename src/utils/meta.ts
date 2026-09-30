/**
 * 写入/更新 <head> 里的 <meta name="...">。
 * 路由守卫与文章页共用，避免重复的 querySelector 样板代码。
 */
export function setMeta(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.name = name
    document.head.appendChild(tag)
  }

  tag.content = content
}
