export interface SnippetParts {
  before: string
  hit: string
  after: string
}

function escapeRegExpChar(ch: string) {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 关键字字符间允许任意空白：让"虚拟DOM"能命中正文中写作"虚拟 DOM"的位置
function buildLooseRegex(keyword: string) {
  const pattern = keyword
    .split('')
    .map(escapeRegExpChar)
    .join('\\s*')
  return new RegExp(pattern, 'i')
}

function squash(text: string) {
  return text.toLowerCase().replace(/\s+/g, '')
}

// 长度保持的 Markdown 标记清理：标记字符替换为空格，保证片段定位索引与原文一致
// （只清理装饰符号 # * ` ~ >，不处理成对语法，避免破坏代码块内容的可读性）
function toDisplayableText(content: string) {
  return (content ?? '').replace(/[#*`~>]/g, ' ')
}

export function extractSnippet(content: string, keyword: string, radius = 44): SnippetParts | null {
  const source = toDisplayableText(content)
  const value = keyword?.trim() ?? ''

  if (!source || !value) {
    return null
  }

  let index = source.toLowerCase().indexOf(value.toLowerCase())
  let hitLength = value.length

  if (index === -1) {
    const loose = buildLooseRegex(value).exec(source)

    if (!loose) {
      return null
    }

    index = loose.index
    hitLength = loose[0].length
  }

  const start = Math.max(0, index - radius)
  const end = Math.min(source.length, index + hitLength + radius)

  return {
    before: `${start > 0 ? '…' : ''}${source.slice(start, index).replace(/\s+/g, ' ')}`,
    hit: source.slice(index, index + hitLength),
    after: `${source.slice(index + hitLength, end).replace(/\s+/g, ' ')}${end < source.length ? '…' : ''}`,
  }
}

// 从 Fuse 的 content 命中区间提取片段（与 Fuse 的命中逻辑保持一致）
export function extractSnippetFromIndices(
  content: string,
  indices: ReadonlyArray<readonly [number, number]>,
  radius = 44,
): SnippetParts | null {
  const source = toDisplayableText(content)

  if (!source || !indices?.length) {
    return null
  }

  const [matchStart, matchEnd] = indices[0]
  const hit = source.slice(matchStart, matchEnd + 1)
  const start = Math.max(0, matchStart - radius)
  const end = Math.min(source.length, matchEnd + 1 + radius)

  // 命中区可能只是关键字去空格后的一部分，补齐上下文即可
  return {
    before: `${start > 0 ? '…' : ''}${source.slice(start, matchStart).replace(/\s+/g, ' ')}`,
    hit,
    after: `${source.slice(matchEnd + 1, end).replace(/\s+/g, ' ')}${end < source.length ? '…' : ''}`,
  }
}

export { squash as squashWhitespace }
