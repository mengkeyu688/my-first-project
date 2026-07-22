<!-- 个人信息表单组件 -->
<template>
  <article class="info-panel">
    <div class="panel-title">{{ title }}</div>

    <el-form
      class="profile-form"
      :model="formModel"
      label-width="118px"
    >
      <el-form-item label="修改密码" required>
        <el-input
          v-model="formModel.password"
          type="password"
          show-password
        />
      </el-form-item>

      <el-form-item label="请再次输入密码" required>
        <el-input
          v-model="formModel.confirmPassword"
          type="password"
          show-password
        />
      </el-form-item>

      <el-form-item class="form-actions">
        <el-button type="primary" size="small" @click="emitSubmit">
          提交
        </el-button>
        <el-button size="small" @click="emitReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </article>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface ProfileForm {
  password: string
  confirmPassword: string
}

withDefaults(defineProps<{
  title?: string
}>(), {
  title: '个人信息',
})

const emit = defineEmits<{
  submit: [form: ProfileForm]
  reset: []
}>()

const formModel = reactive<ProfileForm>({
  password: '',
  confirmPassword: '',
})

const emitSubmit = () => {
  emit('submit', {
    password: formModel.password,
    confirmPassword: formModel.confirmPassword,
  })
}

const emitReset = () => {
  formModel.password = ''
  formModel.confirmPassword = ''
  emit('reset')
}
</script>

<style scoped>
.info-panel {
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

.profile-form {
  width: 100%;
  padding: 39px 14px 0 38px;
}

.profile-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.profile-form :deep(.el-form-item__label) {
  color: #606266;
  font-size: 12px;
}

.profile-form :deep(.el-input__wrapper) {
  height: 22px;
  border-radius: 3px;
}

.form-actions {
  margin-top: 10px;
}

.form-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 8px;
}

.form-actions :deep(.el-button) {
  min-width: 40px;
  height: 22px;
  padding: 0 10px;
  border-radius: 3px;
  font-size: 12px;
}
</style>
