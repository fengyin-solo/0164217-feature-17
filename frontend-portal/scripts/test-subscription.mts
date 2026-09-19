import { createPinia, setActivePinia } from 'pinia'
import { useSubscriptionStore } from '@/stores/subscription'

// localStorage shim
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
}

let failures = 0
const assert = (cond, msg) => {
  if (cond) {
    console.log('  ✓', msg)
  } else {
    failures++
    console.error('  ✗', msg)
  }
}

// 初始化（首次 checkUpdates 应静默建立基线，不产生提醒）
setActivePinia(createPinia())
let store = useSubscriptionStore()
store.checkUpdates()
assert(store.notices.length === 0, '首次访问仅建立内容基线，不产生提醒')

// 1. 空选不允许提交（视图层 warning，store 层 subscribe([]) 返回 0）
assert(store.subscribe([]) === 0, '未选择栏目时订阅数为 0')

// 2. 批量订阅
const added = store.subscribe(['about', 'news'])
assert(added === 2, '批量订阅 2 个栏目成功')
assert(store.subscriptions.length === 2, '当前订阅数为 2')
assert(store.subscriptions[0].sectionName === '关于我们', '订阅记录包含栏目名称')

// 3. 重复订阅不产生重复记录
assert(store.subscribe(['news']) === 0, '重复订阅同一栏目不新增记录')
assert(store.subscriptions.length === 2, '重复订阅后总数仍为 2')

// 4. 模拟新内容 -> 仅订阅栏目产生提醒
const created = store.triggerDemoUpdate()
assert(created >= 1, '已订阅栏目出现新内容时生成提醒')
assert(store.unreadCount === store.notices.filter((n) => !n.read).length, '未读计数正确')

// 5. 同一条内容不会重复提醒（再次 checkUpdates 幂等）
const beforeCount = store.notices.length
store.checkUpdates()
assert(store.notices.length === beforeCount, '重复检测不产生重复提醒')

// 6. 逐条移除订阅
store.unsubscribe('news')
assert(store.subscriptions.length === 1, '逐条移除后订阅数为 1')
assert(!store.isSubscribed('news'), '已移除的栏目不再处于订阅状态')

// 7. 提醒上限：最多保留 20 条，超出清理最早的一条
store.subscribe(['products'])
// 制造 25 条更新
for (let i = 0; i < 25; i++) store.triggerDemoUpdate()
assert(store.notices.length === 20, '提醒超过 20 条时仅保留最近 20 条')

// 8. 全部已读
store.markAllNoticesRead()
assert(store.unreadCount === 0, '全部已读后未读数为 0')

// 9. 无订阅时模拟更新不产生提醒
store.unsubscribe('about')
store.unsubscribe('products')
assert(store.subscriptions.length === 0, '移除全部订阅')
const n = store.triggerDemoUpdate()
assert(n === 0, '没有订阅任何栏目时不产生提醒')

// 10. 刷新后数据保留（重新创建 store，localStorage 仍在）
setActivePinia(createPinia())
store = useSubscriptionStore()
assert(store.subscriptions.length === 0, '刷新后订阅记录从本地恢复（当前为 0）')
assert(store.notices.length === 20, '刷新后提醒记录从本地恢复（保留 20 条）')
assert(store.unreadCount === 0, '刷新后已读状态保留')

// 11. 重新订阅后历史游标仍生效，只对新内容提醒
store.subscribe(['about'])
const c2 = store.triggerDemoUpdate()
assert(c2 === 1, '重新订阅后仅新内容产生 1 条提醒')

console.log(failures === 0 ? '\n全部断言通过 ✅' : `\n${failures} 个断言失败 ❌`)
process.exit(failures === 0 ? 0 : 1)
