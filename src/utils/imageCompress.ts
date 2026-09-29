// 上传图片统一压缩：任何超过 maxBytes 的图片压到 maxBytes 以内（默认 1MB）
// 策略：先限制最大边长，再逐级降低 JPEG 质量；质量到下限仍超时继续缩边重压
const MAX_EDGE = 1920
const MIN_QUALITY = 0.5

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export function formatImageSize(bytes: number) {
  return formatBytes(bytes)
}

export async function compressImageFile(file: File, maxBytes = 1024 * 1024): Promise<File> {
  // 已在限制内的小图不重编码，避免无谓的画质损失
  if (file.size <= maxBytes) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  let scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  let quality = 0.9
  let blob: Blob | null = null

  for (let attempt = 0; attempt < 16; attempt += 1) {
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    // PNG 透明通道转 JPEG 会变黑底，先铺白底
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })

    if (blob && blob.size <= maxBytes) {
      break
    }

    // 质量降到下限后改为缩小尺寸
    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.15)
    } else {
      scale *= 0.85
    }
  }

  bitmap.close()

  if (!blob) {
    throw new Error('图片压缩失败')
  }

  const name = `${file.name.replace(/\.[^.]+$/, '')}.jpg`

  return new File([blob], name, { type: 'image/jpeg' })
}
