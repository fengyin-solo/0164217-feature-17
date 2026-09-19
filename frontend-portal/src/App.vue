<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
    <SubscriptionDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SubscriptionDialog from '@/components/common/SubscriptionDialog.vue'
import { useSubscriptionStore } from '@/stores'

const subscriptionStore = useSubscriptionStore()

// 启动时检测一次栏目更新，之后定时检测（订阅记录与提醒均持久化在本地）
subscriptionStore.checkUpdates()
let updateTimer: number | undefined
onMounted(() => {
  updateTimer = window.setInterval(() => {
    subscriptionStore.checkUpdates()
  }, 60000)
})
onUnmounted(() => {
  if (updateTimer) window.clearInterval(updateTimer)
})
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
}
</style>
