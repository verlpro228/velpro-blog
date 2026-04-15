import type { KnowledgeDoc } from '@/types/content'
import { cloneStaticDocs, STATIC_DOCS } from '@/data/static-docs'

export const docsSeed: KnowledgeDoc[] = STATIC_DOCS

export const cloneDocsSeed = () => cloneStaticDocs(docsSeed)
