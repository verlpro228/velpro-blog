import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('vue', xml)

export interface RenderOptions {
  // 是否为代码块注入语言标签与复制按钮（仅知识库阅读页启用；编辑器预览与 AI 助手保持原输出，互不影响）
  codeCopy?: boolean
}

// render 为同步调用，用模块级开关向 highlight 回传当次渲染的选项
let activeCodeCopy = false

function sanitizeLangLabel(language: unknown) {
  return String(language ?? '')
    .replace(/[^a-zA-Z0-9+#._-]/g, '')
    .slice(0, 20)
}

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    let highlighted: string
    let langLabel: string

    if (language && hljs.getLanguage(language)) {
      highlighted = hljs.highlight(code, { language }).value
      langLabel = sanitizeLangLabel(language) || 'text'
    } else {
      const detected = hljs.highlightAuto(code)
      highlighted = detected.value
      langLabel = sanitizeLangLabel(detected.language) || 'text'
    }

    if (!activeCodeCopy) {
      return `<pre class="hljs"><code>${highlighted}</code></pre>`
    }

    return (
      `<div class="code-block">`
      + `<div class="code-block-head">`
      + `<span class="code-block-lang">${langLabel}</span>`
      + `<button type="button" class="code-block-copy" data-code-copy>复制</button>`
      + `</div>`
      + `<pre class="hljs"><code>${highlighted}</code></pre>`
      + `</div>`
    )
  },
})

export function renderMarkdown(content: string, options: RenderOptions = {}) {
  activeCodeCopy = options.codeCopy ?? false

  try {
    return markdown.render(content)
  } finally {
    activeCodeCopy = false
  }
}
