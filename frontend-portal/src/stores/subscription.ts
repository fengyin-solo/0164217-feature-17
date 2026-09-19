import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { SubscriptionChannel, SubscriptionChannelKey, SubscriptionNotification } from '@/types'
import { newsApi } from '@/api/news'

// 可订阅的栏目
export const SUBSCRIPTION_CHANNELS: SubscriptionChannel[] = [
  { key: 'about', name: '关于我们', path: '/about' },
  { key: 'news', name: '新闻动态', path: '/news' },
  { key: 'products', name: '产品服务', path: '/products' }
]

// 提醒最多保留的条数，超出后清理最早的一条
export const MAX_NOTIFICATIONS = 20

const STORAGE_KEYS = {
  subscriptions: 'portal:subscriptions',
  notifications: 'portal:notifications',
  seenNewsIds: 'portal:seen-news-ids'
}

const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('写入本地存储失败:', error)
  }
}

export const useSubscriptionStore = defineStore('subscription', () => {
  // 已订阅的栏目（持久化，刷新后保留）
  const subscriptions = ref<SubscriptionChannelKey[]>(
    readStorage<SubscriptionChannelKey[]>(STORAGE_KEYS.subscriptions, [])
  )
  // 站内更新提醒（持久化，最多保留最近 MAX_NOTIFICATIONS 条）
  const notifications = ref<SubscriptionNotification[]>(
    readStorage<SubscriptionNotification[]>(STORAGE_KEYS.notifications, [])
  )
  // 已见过的新闻 id，用于识别新内容
  const seenNewsIds = ref<number[]>(readStorage<number[]>(STORAGE_KEYS.seenNewsIds, []))

  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

  const isSubscribed = (key: SubscriptionChannelKey) => subscriptions.value.includes(key)

  const getChannel = (key: SubscriptionChannelKey) =>
    SUBSCRIPTION_CHANNELS.find((channel) => channel.key === key)

  // 批量订阅，同一栏目重复订阅不会产生重复记录
  const subscribe = (keys: SubscriptionChannelKey[]) => {
    const added: SubscriptionChannelKey[] = []
    const duplicated: SubscriptionChannelKey[] = []
    for (const key of new Set(keys)) {
      if (isSubscribed(key)) {
        duplicated.push(key)
      } else {
        subscriptions.value.push(key)
        added.push(key)
      }
    }
    return { added, duplicated }
  }

  // 逐条移除订阅
  const unsubscribe = (key: SubscriptionChannelKey) => {
    subscriptions.value = subscriptions.value.filter((item) => item !== key)
  }

  // 新增一条提醒，超出上限时清理最早的一条
  const pushNotification = (input: { channel: SubscriptionChannelKey; title: string }) => {
    const channel = getChannel(input.channel)
    if (!channel) return
    notifications.value.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channel: channel.key,
      channelName: channel.name,
      title: input.title,
      time: Date.now(),
      read: false
    })
    if (notifications.value.length > MAX_NOTIFICATIONS) {
      notifications.value.splice(MAX_NOTIFICATIONS)
    }
  }

  const markAllRead = () => {
    notifications.value.forEach((item) => {
      item.read = true
    })
  }

  // 检查栏目新内容，为已订阅的栏目生成站内提醒
  const checkForUpdates = async () => {
    try {
      const res = await newsApi.getRecommend(5)
      const latest = res.data ?? []
      const fresh = latest.filter((item) => !seenNewsIds.value.includes(item.id))
      // 首次检查只建立基线，避免历史内容全部变成提醒
      const isBaseline = seenNewsIds.value.length === 0
      if (!isBaseline && isSubscribed('news')) {
        fresh.forEach((item) => {
          pushNotification({ channel: 'news', title: `新闻动态更新：${item.title}` })
        })
      }
      if (fresh.length > 0) {
        seenNewsIds.value = [...seenNewsIds.value, ...fresh.map((item) => item.id)].slice(-100)
      }
    } catch (error) {
      console.error('检查栏目更新失败:', error)
    }
  }

  // 状态变化时持久化，刷新后订阅记录与提醒仍然保留
  watch(subscriptions, (value) => writeStorage(STORAGE_KEYS.subscriptions, value), { deep: true })
  watch(notifications, (value) => writeStorage(STORAGE_KEYS.notifications, value), { deep: true })
  watch(seenNewsIds, (value) => writeStorage(STORAGE_KEYS.seenNewsIds, value), { deep: true })

  return {
    subscriptions,
    notifications,
    unreadCount,
    isSubscribed,
    subscribe,
    unsubscribe,
    pushNotification,
    markAllRead,
    checkForUpdates
  }
})
