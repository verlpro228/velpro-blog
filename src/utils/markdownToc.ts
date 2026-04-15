import type { TocItem } from '@/types/content'

const headingPattern = /<h([2-4])>(.*?)<\/h\1>/g

export function createHeadingSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractToc(renderedHtml: string): TocItem[] {
  return Array.from(renderedHtml.matchAll(headingPattern)).map((match) => {
    const level = Number(match[1])
    const text = match[2].replace(/<[^>]+>/g, '')

    return {
      id: createHeadingSlug(text),
      level,
      text,
    }
  })
}

export function injectHeadingIds(renderedHtml: string) {
  return renderedHtml.replace(headingPattern, (_, level, innerText) => {
    const plainText = innerText.replace(/<[^>]+>/g, '')
    const id = createHeadingSlug(plainText)

    return `<h${level} id="${id}">${innerText}</h${level}>`
  })
}
