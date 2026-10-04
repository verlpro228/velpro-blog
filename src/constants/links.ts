export interface FriendLink {
  name: string
  description: string
  url: string
  avatar?: string
}

// 友链数据：换友链时在数组里增删即可（站点名 / 一句话介绍 / 地址）
export const FRIEND_LINKS: FriendLink[] = [
  {
    name: 'Velpro Blog',
    description: '本站：Vue 3 + FastAPI 全栈自研技术博客，欢迎交换友链。',
    url: 'https://www.velpro.xyz',
  },
  {
    name: 'CVita',
    description: '本站出品：纯前端在线简历生成平台，支持模板切换、实时预览与 PDF 导出。',
    url: 'https://resume.velpro.xyz/',
  },
  {
    name: '星谷创新实验室',
    description: '本站出品：创新实验室招新站点，覆盖前端 / 后端 / AI / 全栈技术方向。',
    url: 'https://cxgc-laboratory.velpro.xyz/',
  },
]

// 申请友链的展示要求（页面提示用）
export const FRIEND_LINK_REQUIREMENTS = [
  '站点可正常访问，内容与技术相关，无违规内容',
  '已在本站可访问的位置（页脚/友链页）添加本站链接',
  '通过 GitHub Issue 或邮箱发送你的站点名称、链接、简介与图标',
]
