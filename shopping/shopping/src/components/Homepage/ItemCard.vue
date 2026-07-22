// 单张卡片项组件
<template>
  <article class="user-card" @click="emitSelect">
    <div class="user-card-top">
      <div class="avatar-box">
        <img v-if="user.avatar" :src="user.avatar" :alt="user.name">
      </div>
      <strong>{{ user.name }}</strong>
    </div>

    <div class="user-card-bottom">
      <span>登录时间：{{ user.loginTime }}</span>
      <span>登录地点：{{ user.location }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
interface UserInfo {
  name: string
  avatar: string
  loginTime: string
  location: string
}

const props = defineProps<{
  user: UserInfo
}>()

const emit = defineEmits<{
  select: [user: UserInfo]
}>()

const emitSelect = () => {
  emit('select', props.user)
}
</script>

<style scoped>
.user-card {
  height: 221px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(37, 57, 83, 0.18);
  cursor: pointer;
}

.user-card-top {
  height: 84px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  border-bottom: 1px solid #e7edf4;
}

.avatar-box {
  width: 45px;
  height: 45px;
  border-radius: 3px;
  background: #c2c7d0;
  overflow: hidden;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card-top strong {
  color: #1f2d3d;
  font-size: 28px;
  font-weight: 500;
}

.user-card-bottom {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 0 22px;
}

.user-card-bottom span {
  color: #1f2d3d;
  font-size: 16px;
  line-height: 1;
  white-space: nowrap;
}
</style>
