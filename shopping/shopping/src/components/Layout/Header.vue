<template>
  <header class="topbar">
    <h1>{{ title }}</h1>

    <el-dropdown
      class="admin-dropdown"
      trigger="hover"
      @command="handleCommand"
    >
      <div class="admin-info">
        <img
          v-if="showAvatarImage"
          class="avatar-image"
          :src="user.avatar"
          alt=""
          @error="handleAvatarError"
        >
        <span v-else class="fallback-avatar">{{ user.name }}</span>
        <el-icon class="arrow-icon">
          <ArrowDown />
        </el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">个人中心</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

interface HeaderUser {
  name: string
  avatar: string
}

const props = defineProps<{
  title: string
  user: HeaderUser
}>()

const emit = defineEmits<{
  command: [command: 'profile' | 'logout']
}>()

const avatarLoadFailed = ref<boolean>(false)

watch(() => props.user.avatar, () => {
  avatarLoadFailed.value = false
}, {
  immediate: true,
})

const hasAvatarImage = computed(() => (
  Boolean(props.user.avatar) && !props.user.avatar.includes('avatar-default')
))

const showAvatarImage = computed(() => hasAvatarImage.value && !avatarLoadFailed.value)

const handleAvatarError = () => {
  avatarLoadFailed.value = true
}

const handleCommand = (command: 'profile' | 'logout') => {
  emit('command', command)
}
</script>

<style scoped>
.topbar {
  width: 100%;
  height: var(--topbar-height, 70px);
  display: flex;
  align-items: center;
  padding: 0 clamp(12px, 1.05vw, 20px);
  color: #ffffff;
  background: linear-gradient(90deg, #1f8bf2 0%, #13bce8 100%);
}

.topbar h1 {
  margin: 0;
  font-size: clamp(14px, 1.15vw, 22px);
  font-weight: normal;
}

.topbar :deep(.el-dropdown) {
  margin-left: auto;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;
  cursor: pointer;
}

.avatar-image,
.fallback-avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
}

.avatar-image {
  border-radius: 50%;
  object-fit: cover;
}

.fallback-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  padding: 0;
  overflow: hidden;
  border-radius: 50%;
  color: #ffffff;
  background: #bfc8d5;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.arrow-icon {
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
}

.admin-dropdown :deep(.el-tooltip__trigger:focus-visible) {
  outline: none;
}
</style>
