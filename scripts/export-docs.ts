// 把 static-docs.ts 里的 8 篇静态文档导出为 JSON，供 seed 脚本导入 MySQL
// 用法：pnpm dlx tsx scripts/export-docs.ts > scripts/docs-seed.json
import { STATIC_DOCS } from './static-docs'

process.stdout.write(JSON.stringify(STATIC_DOCS, null, 2))
