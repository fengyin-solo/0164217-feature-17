import type { SubscribeSection, SectionContentItem } from '@/types'

// 可订阅的栏目
export const SUBSCRIBE_SECTIONS: SubscribeSection[] = [
  {
    id: 'about',
    name: '关于我们',
    description: '公司介绍、团队动态、发展历程等更新',
    path: '/about'
  },
  {
    id: 'news',
    name: '新闻动态',
    description: '公司新闻、产品动态、行业资讯等更新',
    path: '/news'
  },
  {
    id: 'products',
    name: '产品服务',
    description: '新产品发布、服务升级、功能优化等更新',
    path: '/products'
  }
]

// 模拟各栏目的“新内容”标题池，用于演示订阅后的更新提醒
const SIMULATED_TITLES: Record<string, string[]> = {
  about: [
    '公司发布 2026 年度企业社会责任报告',
    '我们迎来第 600 家企业客户',
    '核心团队再添多位资深技术专家',
    '全国第三家区域交付中心正式成立'
  ],
  news: [
    '公司荣获年度数字化服务创新奖',
    '新一代智能数字化平台 3.0 正式发布',
    '2026 行业数字化转型白皮书上线',
    '公司将亮相下周国际数字经济博览会'
  ],
  products: [
    '企业官网服务全新升级，支持一键多端发布',
    '电商平台新增智能营销与数据分析套件',
    '移动应用服务接入 AI 智能客服能力',
    '数字化咨询推出免费成熟度评估服务'
  ]
}

// 各栏目当前最新内容（实际项目中应由后端接口提供）
const sectionFeed: Record<string, SectionContentItem[]> = {
  about: [
    { id: 1001, title: '自 2018 年成立以来，已服务 500+ 企业客户' }
  ],
  news: [
    // 与新闻页列表保持一致
    { id: 1, title: '公司荣获2024年度最佳创新企业奖' },
    { id: 2, title: '新一代数字化平台正式发布' }
  ],
  products: [
    { id: 2001, title: '企业官网、电商平台、移动应用、数字化咨询四大服务' }
  ]
}

// 模拟条目使用时间戳 ID，避免刷新后与历史游标冲突（真实环境 ID 由后端生成）
let nextItemId = Date.now()

// 模拟某个栏目发布了一条新内容（真实项目中可替换为轮询接口）
export const simulateNewUpdate = (
  sectionId: string
): SectionContentItem | null => {
  const pool = SIMULATED_TITLES[sectionId]
  if (!pool) return null

  const feed = sectionFeed[sectionId]
  // 新条目在标题池中循环取用
  const title = pool[feed.length % pool.length]
  const item: SectionContentItem = { id: nextItemId++, title }
  feed.unshift(item)
  return item
}

// 获取栏目当前最新内容条目
export const getLatestItems = (
  sectionId: string,
  limit = 10
): SectionContentItem[] => {
  return (sectionFeed[sectionId] || []).slice(0, limit)
}
