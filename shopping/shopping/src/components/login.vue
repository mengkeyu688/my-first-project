<template>
  <main class="background">
    <section class="card">
      <header class="card-header">
        <h1>商城后台管理系统</h1>
      </header>

      <el-form class="login-form" label-width="88px">
        <el-form-item label="用户名：" required>
          <el-input
            v-model="username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item label="密  码：" required>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item class="button-row">
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button class="reset-button" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login as loginApi } from '../request/api.js'

const router = useRouter()
const username = ref('')
const password = ref('')

const formatDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  try {
    const result = await loginApi({
      username: username.value,
      password: password.value,
    })
    const token = result?.token || result?.jwt || result

    if (token) {
      localStorage.setItem('myToken', token)
    }

    localStorage.setItem('adminName', username.value)
    localStorage.setItem('adminLoginTime', formatDateTime(new Date()))
    router.push('/general')
  } catch {
    ElMessage.error('用户名或密码错误，请重新输入')
  }
}

const handleReset = () => {
  username.value = ''
  password.value = ''
}
</script>

<style scoped>
.background {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("../assets/images/loginBg.jpg") center / cover no-repeat;
}

.card {
  width: 596px;
  min-height: 276px;
  position: relative;
  z-index: 1;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 12px 34px rgba(22, 70, 150, 0.28);
}

.card-header {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8edf3;
}

h1 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 700;
}

.login-form {
  width: 408px;
  margin: 26px auto 0;
}

.button-row {
  margin-top: 26px;
}

.button-row :deep(.el-form-item__content) {
  justify-content: center;
  gap: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  color: #606266;
  font-size: 13px;
}

:deep(.el-input__wrapper) {
  border-radius: 3px;
}

:deep(.el-button) {
  min-width: 72px;
  height: 32px;
  border-radius: 3px;
}

.reset-button {
  color: #ffffff;
  border-color: #909399;
  background: #909399;
}

.reset-button:hover,
.reset-button:focus {
  color: #ffffff;
  border-color: #7f8389;
  background: #7f8389;
}
</style>
