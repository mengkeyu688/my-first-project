<template>
  <article class="avatar-panel">
    <div class="panel-title">{{ title }}</div>

    <div class="avatar-content">
      <div class="avatar-preview">
        <img
          :src="displayAvatar"
          alt=""
          @error="handleAvatarError"
        >
      </div>

      <el-button type="primary" size="small" @click="emitChooseAvatar">
        选择头像
      </el-button>
      <el-button type="success" size="small" @click="emitUploadAvatar">
        上传头像
      </el-button>

      <input
        ref="fileInputRef"
        class="file-input"
        type="file"
        accept="image/*"
        @change="handleFileChange"
      >

      <span v-if="selectedFileName" class="file-name">{{ selectedFileName }}</span>

      <p>{{ note }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import avatarDefault from '../../assets/images/avatar-default.png'

interface ProfileUser {
  name: string
  avatar: string
}

interface AvatarPayload {
  user: ProfileUser
  file: File | null
  fileName: string
}

const props = withDefaults(defineProps<{
  user: ProfileUser
  title?: string
  note?: string
}>(), {
  title: '头像信息',
  note: '限制上传1个文件，且旧文件会被新文件覆盖',
})

const emit = defineEmits<{
  'choose-avatar': [payload: AvatarPayload]
  'upload-avatar': [payload: AvatarPayload]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string>('')
const avatarLoadFailed = ref<boolean>(false)

watch(() => props.user.avatar, () => {
  avatarLoadFailed.value = false
}, {
  immediate: true,
})

const displayAvatar = computed(() => (
  avatarLoadFailed.value ? avatarDefault : (props.user.avatar || avatarDefault)
))

const emitChooseAvatar = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  selectedFile.value = file
  selectedFileName.value = file?.name || ''

  emit('choose-avatar', {
    user: props.user,
    file,
    fileName: selectedFileName.value,
  })
}

const emitUploadAvatar = () => {
  emit('upload-avatar', {
    user: props.user,
    file: selectedFile.value,
    fileName: selectedFileName.value,
  })
}

const handleAvatarError = () => {
  avatarLoadFailed.value = true
}
</script>

<style scoped>
.avatar-panel {
  height: 221px;
  overflow: hidden;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(37, 57, 83, 0.18);
}

.panel-title {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #e7edf4;
}

.avatar-content {
  height: 179px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 15px;
}

.avatar-preview {
  width: 34px;
  height: 34px;
  margin-bottom: 14px;
  border-radius: 3px;
  background: #c2c7d0;
  overflow: hidden;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-content :deep(.el-button) {
  min-width: 58px;
  height: 22px;
  margin: 0 0 10px;
  padding: 0 10px;
  border-radius: 3px;
  font-size: 12px;
}

.file-input {
  display: none;
}

.file-name {
  max-width: 220px;
  margin: 0 0 8px;
  overflow: hidden;
  color: #409eff;
  font-size: 11px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-content p {
  margin: 0;
  color: #606266;
  font-size: 11px;
}
</style>
