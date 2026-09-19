<template>
  <el-dialog
    v-model="visible"
    title="栏目更新订阅"
    width="520px"
    class="subscribe-dialog"
    @open="handleOpen"
  >
    <!-- 选择栏目 -->
    <div class="dialog-block">
      <h4 class="block-title">选择感兴趣的栏目</h4>
      <el-checkbox-group v-model="selectedIds" class="section-options">
        <label
          v-for="section in availableSections"
          :key="section.id"
          class="section-option"
        >
          <el-checkbox :value="section.id">
            <span class="option-name">{{ section.name }}</span>
            <span class="option-desc">{{ section.description }}</span>
          </el-checkbox>
        </label>
      </el-checkbox-group>
      <el-empty
        v-if="availableSections.length === 0"
        description="您已订阅全部栏目"
        :image-size="64"
      />
    </div>

    <!-- 当前订阅 -->
    <div class="dialog-block">
      <h4 class="block-title">
        当前订阅
        <span class="block-count">{{ subscriptionStore.subscriptions.length }}</span>
      </h4>
      <div v-if="subscriptionStore.subscriptions.length > 0" class="subscribed-list">
        <el-tag
          v-for="item in subscriptionStore.subscriptions"
          :key="item.sectionId"
          class="subscribed-tag"
          type="primary"
          closable
          @close="subscriptionStore.unsubscribe(item.sectionId)"
        >
          {{ item.sectionName }}
        </el-tag>
      </div>
      <el-empty
        v-else
        description="尚未订阅任何栏目"
        :image-size="64"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button :disabled="selectedIds.length === 0" @click="clearSelection">
          取消勾选
        </el-button>
        <el-button type="primary" :disabled="selectedIds.length === 0" @click="handleSubmit">
          提交订阅{{ selectedIds.length > 0 ? `（${selectedIds.length} 项）` : '' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useSubscriptionStore } from '@/stores'
import { SUBSCRIBE_SECTIONS } from '@/config/sections'

const subscriptionStore = useSubscriptionStore()
const { dialogVisible: visible } = storeToRefs(subscriptionStore)

const selectedIds = ref<string[]>([])

// 尚未订阅的栏目
const availableSections = computed(() =>
  SUBSCRIBE_SECTIONS.filter(
    (section) => !subscriptionStore.isSubscribed(section.id)
  )
)

const handleOpen = () => {
  selectedIds.value = []
}

// 提交前一次性清空所有已勾选栏目
const clearSelection = () => {
  selectedIds.value = []
}

const handleSubmit = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一个栏目后再提交订阅')
    return
  }
  const added = subscriptionStore.subscribe(selectedIds.value)
  if (added > 0) {
    ElMessage.success(`订阅成功，已订阅 ${added} 个栏目`)
  }
  selectedIds.value = []
}
</script>

<style lang="scss" scoped>
.dialog-block {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.block-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-md;
}

.block-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: $font-size-xs;
  color: $primary-color;
  background: rgba($primary-color, 0.1);
  border-radius: $border-radius-full;
}

.section-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.section-option {
  display: flex;
  padding: $spacing-md;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $primary-color-light;
    background: rgba($primary-color, 0.03);
  }

  :deep(.el-checkbox) {
    height: auto;
    align-items: flex-start;
  }

  :deep(.el-checkbox__label) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: $spacing-sm;
  }
}

.option-name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $text-color-primary;
}

.option-desc {
  font-size: $font-size-xs;
  color: $text-color-secondary;
  line-height: $line-height-normal;
}

.subscribed-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.subscribed-tag {
  font-size: $font-size-sm;
  border-radius: $border-radius-full;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
}
</style>
