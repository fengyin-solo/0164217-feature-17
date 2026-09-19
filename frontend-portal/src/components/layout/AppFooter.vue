<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 顶部 CTA -->
      <div class="footer-cta">
        <div class="cta-content">
          <h2>准备好开启数字化之旅了吗？</h2>
          <p>与我们的专家团队交流，获取专属解决方案</p>
        </div>
        <el-button class="cta-btn" size="large" round @click="router.push('/contact')">
          立即咨询
          <el-icon><Right /></el-icon>
        </el-button>
      </div>

      <!-- 主要内容 -->
      <div class="footer-main">
        <div class="footer-brand">
          <div class="brand-logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#footer-logo)"/>
              <path d="M10 16L14 12L18 16L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M10 20L14 16L18 20L22 16" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
              <defs>
                <linearGradient id="footer-logo" x1="0" y1="0" x2="32" y2="32">
                  <stop stop-color="#6366f1"/>
                  <stop offset="1" stop-color="#a855f7"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Portal</span>
          </div>
          <p class="brand-desc">
            专注于企业数字化转型，提供全方位的技术解决方案，助力企业实现智能化升级。
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="微信" @click.prevent="handleNotImplemented">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </a>
            <a href="#" class="social-link" aria-label="微博" @click.prevent="handleNotImplemented">
              <el-icon :size="20"><Share /></el-icon>
            </a>
            <a href="#" class="social-link" aria-label="GitHub" @click.prevent="handleNotImplemented">
              <el-icon :size="20"><Link /></el-icon>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>产品服务</h4>
            <router-link to="/products">企业官网</router-link>
            <router-link to="/products">电商平台</router-link>
            <router-link to="/products">移动应用</router-link>
            <router-link to="/products">数字化咨询</router-link>
          </div>

          <div class="link-group">
            <h4>关于我们</h4>
            <router-link to="/about">公司介绍</router-link>
            <router-link to="/about">发展历程</router-link>
            <router-link to="/about">团队成员</router-link>
            <router-link to="/news">新闻动态</router-link>
          </div>

          <div class="link-group">
            <h4>联系方式</h4>
            <a href="tel:400-888-8888">400-888-8888</a>
            <a href="mailto:hello@portal.com">hello@portal.com</a>
            <span>北京市朝阳区科技园区</span>
            <span>工作日 9:00-18:00</span>
          </div>
        </div>
      </div>

      <!-- 栏目订阅 -->
      <div class="footer-subscribe">
        <div class="subscribe-info">
          <h4>
            <el-icon><Bell /></el-icon>
            订阅栏目更新
          </h4>
          <p>勾选感兴趣的栏目，有新内容时将在站内提醒您</p>
        </div>

        <div class="subscribe-form">
          <el-checkbox-group v-model="selectedChannels">
            <el-checkbox
              v-for="channel in channels"
              :key="channel.key"
              :value="channel.key"
            >
              {{ channel.name }}
            </el-checkbox>
          </el-checkbox-group>

          <div class="subscribe-actions">
            <el-button type="primary" round @click="handleSubscribe">提交订阅</el-button>
            <el-button round :disabled="selectedChannels.length === 0" @click="clearSelection">
              清空选择
            </el-button>

            <el-popover placement="top" :width="360" trigger="click" :teleported="false">
              <template #reference>
                <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notify-badge">
                  <el-button round>
                    <el-icon><Bell /></el-icon>
                    更新提醒
                  </el-button>
                </el-badge>
              </template>

              <div class="notify-panel">
                <div class="notify-header">
                  <span class="notify-title">更新提醒</span>
                  <el-button
                    v-if="unreadCount > 0"
                    link
                    type="primary"
                    size="small"
                    @click="subscriptionStore.markAllRead()"
                  >
                    全部已读
                  </el-button>
                </div>

                <p v-if="subscriptions.length === 0" class="notify-empty">
                  您还未订阅任何栏目，勾选上方感兴趣的栏目并提交订阅后，栏目有新内容时会在这里提醒您。
                </p>
                <p v-else-if="notifications.length === 0" class="notify-empty">
                  暂无新的更新提醒，已订阅栏目有新内容时会第一时间通知您。
                </p>
                <ul v-else class="notify-list">
                  <li
                    v-for="item in notifications"
                    :key="item.id"
                    class="notify-item"
                    :class="{ unread: !item.read }"
                  >
                    <el-tag size="small" effect="plain">{{ item.channelName }}</el-tag>
                    <div class="notify-item-content">
                      <p class="notify-item-title">{{ item.title }}</p>
                      <span class="notify-item-time">{{ formatTime(item.time) }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </el-popover>
          </div>
        </div>

        <div v-if="subscriptions.length > 0" class="subscribed-list">
          <span class="subscribed-label">已订阅：</span>
          <el-tag
            v-for="key in subscriptions"
            :key="key"
            closable
            class="subscribed-tag"
            @close="handleUnsubscribe(key)"
          >
            {{ channelName(key) }}
          </el-tag>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="footer-bottom">
        <p>© {{ currentYear }} Portal. All rights reserved.</p>
        <div class="footer-legal">
          <a href="#" @click.prevent="handleNotImplemented">隐私政策</a>
          <a href="#" @click.prevent="handleNotImplemented">服务条款</a>
          <a href="#" @click.prevent="handleNotImplemented">京ICP备xxxxxxxx号</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useSubscriptionStore, SUBSCRIPTION_CHANNELS } from '@/stores/subscription'
import type { SubscriptionChannelKey } from '@/types'

const router = useRouter()
const currentYear = computed(() => new Date().getFullYear())

const handleNotImplemented = () => {
  ElMessage.info('功能开发中，敬请期待')
}

// ==================== 栏目订阅 ====================
const subscriptionStore = useSubscriptionStore()
const { subscriptions, notifications, unreadCount } = storeToRefs(subscriptionStore)

const channels = SUBSCRIPTION_CHANNELS
const selectedChannels = ref<SubscriptionChannelKey[]>([])

const channelName = (key: SubscriptionChannelKey) =>
  channels.find((channel) => channel.key === key)?.name ?? key

// 提交前一次性取消所有已勾选的栏目
const clearSelection = () => {
  selectedChannels.value = []
}

const handleSubscribe = () => {
  if (selectedChannels.value.length === 0) {
    ElMessage.warning('请至少选择一个感兴趣的栏目')
    return
  }
  const { added, duplicated } = subscriptionStore.subscribe(selectedChannels.value)
  if (added.length > 0) {
    ElMessage.success(`已成功订阅 ${added.length} 个栏目`)
  }
  if (duplicated.length > 0) {
    ElMessage.info(`${duplicated.map(channelName).join('、')} 已在订阅列表中，无需重复订阅`)
  }
  selectedChannels.value = []
}

// 逐条移除已订阅的栏目
const handleUnsubscribe = (key: SubscriptionChannelKey) => {
  subscriptionStore.unsubscribe(key)
  ElMessage.success(`已取消订阅「${channelName(key)}」`)
}

const formatTime = (time: number) => {
  const date = new Date(time)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<style lang="scss" scoped>
.app-footer {
  background: $bg-color-dark;
  color: rgba(255, 255, 255, 0.8);
  margin-top: auto;
}

.footer-container {
  max-width: $container-max-width;
  margin: 0 auto;
  padding: $spacing-4xl $spacing-lg $spacing-xl;
}

// CTA 区域
.footer-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-xl;
  padding: $spacing-3xl;
  background: $gradient-primary;
  border-radius: $border-radius-xl;
  margin-bottom: $spacing-4xl;
  
  .cta-content {
    h2 {
      font-size: $font-size-3xl;
      color: white;
      margin-bottom: $spacing-sm;
    }
    
    p {
      font-size: $font-size-lg;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .cta-btn {
    flex-shrink: 0;
    background: white;
    color: $primary-color;
    font-weight: 600;
    padding: $spacing-md $spacing-xl;
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
    }
  }
}

// 主要内容
.footer-main {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: $spacing-4xl;
  padding-bottom: $spacing-3xl;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand {
  .brand-logo {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
    
    span {
      font-size: $font-size-xxl;
      font-weight: 700;
      color: white;
    }
  }
  
  .brand-desc {
    font-size: $font-size-md;
    line-height: $line-height-loose;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: $spacing-lg;
    max-width: 320px;
  }
}

.social-links {
  display: flex;
  gap: $spacing-sm;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-md;
  color: rgba(255, 255, 255, 0.8);
  transition: all $transition-fast;
  
  &:hover {
    background: $primary-color;
    color: white;
    transform: translateY(-2px);
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-xl;
}

.link-group {
  h4 {
    font-size: $font-size-sm;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: $spacing-lg;
  }
  
  a, span {
    display: block;
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.6);
    padding: $spacing-xs 0;
    transition: color $transition-fast;
  }
  
  a:hover {
    color: white;
  }
}

// 底部版权
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $spacing-xl;
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.4);
}

.footer-legal {
  display: flex;
  gap: $spacing-lg;
  
  a {
    color: rgba(255, 255, 255, 0.4);
    transition: color $transition-fast;
    
    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 栏目订阅
.footer-subscribe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;
  padding: $spacing-xl 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.subscribe-info {
  h4 {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-md;
    font-weight: 600;
    color: white;
    margin-bottom: $spacing-xs;
  }

  p {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.6);
  }
}

.subscribe-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-lg;

  :deep(.el-checkbox) {
    color: rgba(255, 255, 255, 0.8);
  }
}

.subscribe-actions {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.notify-badge {
  display: inline-flex;
}

.subscribed-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  width: 100%;

  .subscribed-label {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.6);
  }
}

// 更新提醒弹层
.notify-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;

  .notify-title {
    font-size: $font-size-md;
    font-weight: 600;
  }
}

.notify-empty {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  line-height: $line-height-loose;
}

.notify-list {
  max-height: 320px;
  overflow-y: auto;
}

.notify-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-sm 0;

  & + .notify-item {
    border-top: 1px solid $border-color-light;
  }

  &.unread .notify-item-title {
    font-weight: 600;
  }
}

.notify-item-content {
  flex: 1;
  min-width: 0;

  .notify-item-title {
    font-size: $font-size-sm;
    color: $text-color-primary;
    line-height: $line-height-normal;
  }

  .notify-item-time {
    font-size: $font-size-xs;
    color: $text-color-secondary;
  }
}

@media (max-width: $breakpoint-lg) {
  .footer-cta {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: $spacing-xl;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $breakpoint-md) {
  .footer-links {
    grid-template-columns: 1fr;
  }

  .footer-subscribe {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-bottom {
    flex-direction: column;
    gap: $spacing-md;
    text-align: center;
  }
}
</style>
