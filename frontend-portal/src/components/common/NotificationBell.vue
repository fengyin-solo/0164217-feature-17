<template>
  <el-popover
    placement="bottom-end"
    :width="360"
    trigger="click"
    popper-class="notice-popover"
  >
    <template #reference>
      <button class="notice-bell" aria-label="栏目更新提醒">
        <el-badge :value="subscriptionStore.unreadCount" :hidden="subscriptionStore.unreadCount === 0" :max="99">
          <el-icon :size="20"><Bell /></el-icon>
        </el-badge>
      </button>
    </template>

    <div class="notice-panel">
      <div class="notice-header">
        <span class="notice-title">栏目更新提醒</span>
        <el-button
          v-if="subscriptionStore.notices.length > 0"
          link
          type="primary"
          size="small"
          @click="subscriptionStore.markAllNoticesRead()"
        >
          全部已读
        </el-button>
      </div>

      <!-- 未订阅任何栏目 -->
      <div v-if="subscriptionStore.subscriptions.length === 0" class="notice-empty">
        <el-icon :size="36"><BellFilled /></el-icon>
        <p class="empty-title">您还没有订阅任何栏目</p>
        <p class="empty-desc">订阅感兴趣的栏目后，有新内容时会在这里提醒您</p>
        <el-button type="primary" round size="small" @click="goSubscribe">
          去订阅
        </el-button>
      </div>

      <!-- 已订阅但暂无提醒 -->
      <div v-else-if="subscriptionStore.notices.length === 0" class="notice-empty">
        <el-icon :size="36"><BellFilled /></el-icon>
        <p class="empty-title">暂无更新提醒</p>
        <p class="empty-desc">
          您订阅了 {{ subscriptionStore.subscriptions.length }} 个栏目，有新内容时会第一时间通知您
        </p>
      </div>

      <!-- 提醒列表 -->
      <div v-else class="notice-list">
        <div
          v-for="notice in subscriptionStore.notices"
          :key="notice.id"
          class="notice-item"
          :class="{ unread: !notice.read }"
          @click="openNotice(notice)"
        >
          <span v-if="!notice.read" class="unread-dot"></span>
          <div class="notice-body">
            <div class="notice-meta">
              <el-tag size="small" effect="plain">{{ notice.sectionName }}</el-tag>
              <span class="notice-time">{{ formatTime(notice.createdAt) }}</span>
            </div>
            <p class="notice-text">{{ notice.title }}</p>
          </div>
        </div>
      </div>

      <!-- 模拟新内容（演示用，真实环境由后端推送替代） -->
      <div v-if="subscriptionStore.subscriptions.length > 0" class="notice-footer">
        <el-button link type="primary" size="small" @click="handleDemoUpdate">
          模拟有新内容
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSubscriptionStore } from '@/stores'
import type { SubscriptionNotice } from '@/types'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()

const goSubscribe = () => {
  subscriptionStore.openSubscriptionDialog()
}

const openNotice = (notice: SubscriptionNotice) => {
  subscriptionStore.markNoticeRead(notice.id)
  router.push(notice.path)
}

const handleDemoUpdate = () => {
  const created = subscriptionStore.triggerDemoUpdate()
  if (created > 0) {
    ElMessage.success('您订阅的栏目有新内容更新')
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.notice-bell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: $text-color-regular;
  background: transparent;
  border: none;
  border-radius: $border-radius-full;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    color: $primary-color;
    background: $bg-color-light;
  }
}

.notice-panel {
  margin: -12px;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-color-light;
}

.notice-title {
  font-size: $font-size-md;
  font-weight: 600;
  color: $text-color-primary;
}

.notice-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl $spacing-lg;
  text-align: center;

  .el-icon {
    color: $text-color-placeholder;
    margin-bottom: $spacing-md;
  }

  .empty-title {
    font-size: $font-size-md;
    font-weight: 500;
    color: $text-color-primary;
    margin-bottom: $spacing-xs;
  }

  .empty-desc {
    font-size: $font-size-sm;
    color: $text-color-secondary;
    line-height: $line-height-normal;
    margin-bottom: $spacing-md;
  }
}

.notice-list {
  max-height: 320px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $bg-color-light;
  }

  &.unread {
    background: rgba($primary-color, 0.04);
  }
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  background: $error-color;
  border-radius: $border-radius-round;
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notice-time {
  font-size: $font-size-xs;
  color: $text-color-secondary;
}

.notice-text {
  font-size: $font-size-sm;
  color: $text-color-primary;
  line-height: $line-height-normal;
}

.notice-footer {
  display: flex;
  justify-content: center;
  padding: $spacing-sm;
  border-top: 1px solid $border-color-light;
}
</style>
