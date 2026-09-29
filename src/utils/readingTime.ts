// 中文按 400 字/分钟、英文按 200 词/分钟粗估阅读时长，最低 1 分钟
export function estimateReadingMinutes(markdown: string): number {
  if (!markdown) {
    return 0
  }

  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*~|_=-]/g, ' ')

  const cjkChars = (plain.match(/[\u4e00-\u9fff]/g) ?? []).length
  const words = plain
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  if (!cjkChars && !words) {
    return 0
  }

  return Math.max(1, Math.round(cjkChars / 400 + words / 200))
}
