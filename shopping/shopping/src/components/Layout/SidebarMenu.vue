// 侧边菜单组件
<template>
  <aside class="sidebar">
    <el-menu
      :default-active="activeIndex"
      class="menu"
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#ffffff"
      @select="handleSelect"
    >
      <el-menu-item
        v-for="item in items"
        :key="item.index"
        :index="item.index"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface MenuItem {
  index: string
  label: string
  icon: Component
}

const props = defineProps<{
  activeIndex: string
  items: MenuItem[]
}>()

const emit = defineEmits<{
  'update:activeIndex': [index: string]
  select: [item: MenuItem]
}>()

const handleSelect = (index: string) => {
  const item = props.items.find((menuItem) => menuItem.index === index)

  if (!item) {
    return
  }

  emit('update:activeIndex', index)
  emit('select', item)
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width, 223px);
  flex: 0 0 var(--sidebar-width, 223px);
  background: #ffffff;
  box-shadow: 2px 0 10px rgba(26, 57, 96, 0.08);
}

.menu {
  width: 100%;
  border-right: 0;
}

:deep(.el-menu-item) {
  height: var(--menu-item-height, 63px);
  padding-left: var(--menu-item-padding, 24px);
  font-size: 14px;
}

:deep(.el-menu-item.is-active) {
  background: #19aee8;
}

:deep(.el-icon) {
  margin-right: var(--menu-icon-gap, 12px);
  font-size: 16px;
}
</style>
