import type { KnowledgeDoc } from '@/types/content'

export type DocExportFormat = 'markdown' | 'pdf' | 'json'

// A4 纸张尺寸（毫米）与页边距
const PDF_PAGE = { width: 210, height: 297, margin: 15 }
// 离屏渲染容器宽度（A4 宽度 @96dpi）
const PDF_CONTAINER_WIDTH = 794
// 页面壳上下内边距（左右为 56px）
const PDF_CONTAINER_PADDING_Y = 48
// 单页正文区域的像素高度（按 A4 内容区等比换算）
const CONTENT_WIDTH_PX = PDF_CONTAINER_WIDTH - 56 * 2
const CONTENT_HEIGHT_PX = Math.floor(
  (CONTENT_WIDTH_PX * (PDF_PAGE.height - PDF_PAGE.margin * 2)) / (PDF_PAGE.width - PDF_PAGE.margin * 2),
)

function sanitizeFilename(title: string) {
  return title.replace(/[\\/:*?"<>|]/g, '-').trim() || 'untitled'
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function exportDocAsMarkdown(doc: KnowledgeDoc) {
  const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' })
  triggerDownload(`${sanitizeFilename(doc.title)}.md`, blob)
}

export function exportDocAsJson(doc: KnowledgeDoc) {
  const payload = {
    id: doc.id,
    title: doc.title,
    summary: doc.summary,
    tags: doc.tags,
    createTime: doc.createTime,
    content: doc.content,
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  triggerDownload(`${sanitizeFilename(doc.title)}.json`, blob)
}

const PDF_EXPORT_ID = 'velpro-pdf-export'

const PDF_CONTAINER_STYLE = `
  #${PDF_EXPORT_ID} .pdf-page {
    width: ${PDF_CONTAINER_WIDTH}px;
    height: ${CONTENT_HEIGHT_PX + PDF_CONTAINER_PADDING_Y * 2}px;
    padding: ${PDF_CONTAINER_PADDING_Y}px 56px;
    box-sizing: border-box;
    background: #ffffff;
    overflow: hidden;
  }
  #${PDF_EXPORT_ID} .doc-meta { font-size: 13px; color: #64748b; margin: 0; }
  #${PDF_EXPORT_ID} .doc-title { margin: 12px 0 8px; font-size: 30px; line-height: 1.3; }
  #${PDF_EXPORT_ID} .doc-summary { margin: 0 0 28px; font-size: 14px; color: #475569; }
  #${PDF_EXPORT_ID} .doc-divider { margin: 0 0 32px; border: 0; border-top: 1px solid #e2e8f0; }
  #${PDF_EXPORT_ID} .doc-content { overflow-wrap: break-word; }
  /* 知识库页代码块自带"语言 + 复制"头部，PDF 里只保留代码本体 */
  #${PDF_EXPORT_ID} .doc-content .code-block-head { display: none; }
  #${PDF_EXPORT_ID} .doc-content .code-block { margin: 0 0 14px; }
  #${PDF_EXPORT_ID} .doc-content .code-block pre { margin: 0; }
  #${PDF_EXPORT_ID} .doc-content h1, #${PDF_EXPORT_ID} .doc-content h2, #${PDF_EXPORT_ID} .doc-content h3 { line-height: 1.4; margin: 28px 0 12px; }
  #${PDF_EXPORT_ID} .doc-content p { margin: 0 0 14px; }
  #${PDF_EXPORT_ID} .doc-content pre {
    padding: 14px 16px;
    border-radius: 10px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    overflow-x: auto;
    font-size: 13px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  #${PDF_EXPORT_ID} .doc-content code { font-family: Consolas, Menlo, monospace; font-size: 13px; }
  #${PDF_EXPORT_ID} .doc-content :not(pre) > code {
    padding: 2px 6px;
    border-radius: 6px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
  }
  #${PDF_EXPORT_ID} .doc-content blockquote {
    margin: 0 0 14px;
    padding: 4px 16px;
    border-left: 3px solid #cbd5e1;
    color: #475569;
  }
  #${PDF_EXPORT_ID} .doc-content img { max-width: 100%; }
  #${PDF_EXPORT_ID} .doc-content table { border-collapse: collapse; width: 100%; margin: 0 0 14px; }
  #${PDF_EXPORT_ID} .doc-content th, #${PDF_EXPORT_ID} .doc-content td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
`

export async function exportDocAsPdf(doc: KnowledgeDoc, renderedHtml: string) {
  // 按需加载，不占用首屏体积
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ])

  const tags = doc.tags.map(escapeHtml).join(' / ')
  const headerHtml = `
    <p class="doc-meta">${escapeHtml(doc.createTime)}${tags ? ` · ${tags}` : ''}</p>
    <h1 class="doc-title">${escapeHtml(doc.title)}</h1>
    <p class="doc-summary">${escapeHtml(doc.summary)}</p>
    <hr class="doc-divider" />
  `

  const container = document.createElement('div')
  container.id = PDF_EXPORT_ID
  container.style.cssText = 'position:absolute;left:-10000px;top:0;z-index:-1;'
  container.innerHTML = `<style>${PDF_CONTAINER_STYLE}</style>`

  // 必须先挂载到文档再分页：未挂载的元素没有布局，scrollHeight 恒为 0，溢出判断会失效
  document.body.appendChild(container)

  try {
    // 解析出块级元素，逐块分页，避免按像素硬切导致文字被拦腰切断
    const parseHost = document.createElement('div')
    parseHost.innerHTML = renderedHtml
    const blocks = Array.from(parseHost.children)

    const shells: HTMLElement[] = []

    const createShell = () => {
      const shell = document.createElement('div')
      shell.className = 'pdf-page'
      const content = document.createElement('div')
      content.className = 'doc-content'
      shell.appendChild(content)
      container.appendChild(shell)
      shells.push(shell)
      return { shell, content }
    }

    // 首页放文档头部信息，再填充正文块
    const first = createShell()
    first.shell.insertAdjacentHTML('afterbegin', headerHtml)

    let current = first.content

    for (const block of blocks) {
      current.appendChild(block)

      // 当前页溢出时，把最后一个块移到新页（单个块自己超高一页时只能截断，属罕见情况）
      const shell = current.parentElement as HTMLElement
      if (shell.scrollHeight > shell.clientHeight) {
        const overflowBlock = current.lastElementChild as HTMLElement
        current.removeChild(overflowBlock)
        current = createShell().content
        current.appendChild(overflowBlock)
      }
    }

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

    for (const [index, shell] of shells.entries()) {
      const canvas = await html2canvas(shell, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      if (index > 0) {
        pdf.addPage()
      }

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.92),
        'JPEG',
        PDF_PAGE.margin,
        PDF_PAGE.margin,
        PDF_PAGE.width - PDF_PAGE.margin * 2,
        PDF_PAGE.height - PDF_PAGE.margin * 2,
      )
    }

    pdf.save(`${sanitizeFilename(doc.title)}.pdf`)
    return true
  }
  finally {
    container.remove()
  }
}
