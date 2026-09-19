import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription, SubscriptionNotice } from '@/types'
import { SUBSCRIBE_SECTIONS, getLatestItems, simulateNewUpdate } from '@/config/sections'

const SUBSCRIPTIONS_KEY = 'portal:subscriptions'
const NOTICES_KEY = 'portal:subscription-notices'
const CURSOR_KEY = 'portal:section-cursor'

// 提醒最多保留的条数，超出后清理最早的一条
const MAX_NOTICES = 20

const load = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (error) {
    console.error('读取本地数据失败:', error)
    return fallback
  }
}

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('写入本地数据失败:', error)
  }
}

export const useSubscriptionStore = defineStore('subscription', () => {
  // 已订阅栏目
  const subscriptions = ref<Subscription[]>(
    load<Subscription[]>(SUBSCRIPTIONS_KEY, [])
  )
  // 栏目更新提醒（最新的在前）
  const notices = ref<SubscriptionNotice[]>(
    load<SubscriptionNotice[]>(NOTICES_KEY, [])
  )
  // 订阅弹窗可见性（页脚入口与头部提醒入口共用）
  const dialogVisible = ref(false)

  // 各栏目已知内容的游标，用于识别“新内容”
  const cursor = ref<Record<string, number[]>>(
    load<Record<string, number[]>>(CURSOR_KEY, {})
  )

  const subscribedSectionIds = computed(() =>
    subscriptions.value.map((item) => item.sectionId)
  )

  const unreadCount = computed(() =>
    notices.value.filter((item) => !item.read).length
  )

  const isSubscribed = (sectionId: string) =>
    subscriptions.value.some((item) => item.sectionId === sectionId)

  const persistSubscriptions = () => save(SUBSCRIPTIONS_KEY, subscriptions.value)
  const persistNotices = () => save(NOTICES_KEY, notices.value)
  const persistCursor = () => save(CURSOR_KEY, cursor.value)

  const openSubscriptionDialog = () => {
    dialogVisible.value = true
  }
  const closeSubscriptionDialog = () => {
    dialogVisible.value = false
  }

  // 批量订阅，自动去重，返回新增订阅的栏目数
  const subscribe = (sectionIds: string[]): number => {
    let added = 0
    sectionIds.forEach((sectionId) => {
      if (isSubscribed(sectionId)) return
      const section = SUBSCRIBE_SECTIONS.find((item) => item.id === sectionId)
      if (!section) return
      subscriptions.value.push({
        sectionId: section.id,
        sectionName: section.name,
        path: section.path,
        subscribeTime: new Date().toISOString()
      })
      added += 1
    })
    persistSubscriptions()
    return added
  }

  // 逐条移除订阅
  const unsubscribe = (sectionId: string) => {
    subscriptions.value = subscriptions.value.filter(
      (item) => item.sectionId !== sectionId
    )
    persistSubscriptions()
  }

  // 新增一条提醒，幂等且按上限裁剪；返回是否真正产生了新提醒
  const addNotice = (notice: SubscriptionNotice): boolean => {
    if (notices.value.some((item) => item.id === notice.id)) return false
    notices.value.unshift(notice)
    while (notices.value.length > MAX_NOTICES) {
      // 超出上限后清理最早的一条
      notices.value.pop()
    }
    persistNotices()
    return true
  }

  const markNoticeRead = (noticeId: string) => {
    const notice = notices.value.find((item) => item.id === noticeId)
    if (notice && !notice.read) {
      notice.read = true
      persistNotices()
    }
  }

  const markAllNoticesRead = () => {
    if (notices.value.every((item) => item.read)) return
    notices.value.forEach((item) => {
      item.read = true
    })
    persistNotices()
  }

  // 检查各栏目是否有新内容；已订阅栏目的新内容生成站内提醒，返回新增提醒数
  const checkUpdates = (): number => {
    let created = 0
    SUBSCRIBE_SECTIONS.forEach((section) => {
      const items = getLatestItems(section.id)
      const knownIds = cursor.value[section.id]

      // 首次见到该栏目：仅建立基线，不产生提醒
      if (!knownIds) {
        cursor.value[section.id] = items.map((item) => item.id)
        persistCursor()
        return
      }

      const newItems = items.filter((item) => !knownIds.includes(item.id))
      if (newItems.length === 0) return

      // 更新游标
      cursor.value[section.id] = [
        ...newItems.map((item) => item.id),
        ...knownIds
      ]
      persistCursor()

      // 仅订阅了该栏目才提醒；getLatestItems 按最新在前，这里倒序插入保证最新提醒排最前
      if (isSubscribed(section.id)) {
        ;[...newItems].reverse().forEach((item) => {
          if (
            addNotice({
              id: `${section.id}-${item.id}`,
              sectionId: section.id,
              sectionName: section.name,
              title: item.title,
              path: section.path,
              createdAt: new Date().toISOString(),
              read: false
            })
          ) {
            created += 1
          }
        })
      }
    })
    return created
  }

  // 演示用：让一个已订阅栏目产生一条新内容并立即检测（真实项目由后端推送或轮询接口代替）
  const triggerDemoUpdate = (): number => {
    if (subscriptions.value.length === 0) return 0
    const section =
      subscriptions.value[Math.floor(Math.random() * subscriptions.value.length)]
    const item = simulateNewUpdate(section.sectionId)
    if (!item) return 0
    return checkUpdates()
  }

  return {
    subscriptions,
    notices,
    dialogVisible,
    subscribedSectionIds,
    unreadCount,
    isSubscribed,
    openSubscriptionDialog,
    closeSubscriptionDialog,
    subscribe,
    unsubscribe,
    markNoticeRead,
    markAllNoticesRead,
    checkUpdates,
    triggerDemoUpdate
  }
})
