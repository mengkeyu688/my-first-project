<template>
  <div class="admin-layout">
    <Header
      :title="pageTitle"
      :user="adminInfo"
      @command="handleHeaderCommand"
    />

    <div class="page-body">
      <SidebarMenu
        v-model:active-index="activeMenu"
        :items="menuItems"
      />

      <ProfileCenter
        v-if="isProfilePage"
        :user="adminInfo"
        @choose-avatar="handleChooseAvatar"
        @upload-avatar="handleUploadAvatar"
        @submit="handleProfileSubmit"
      />

      <GoodsManagement v-else-if="isGoodsPage" />

      <CategoryManagement v-else-if="isCategoryPage" />

      <main v-else class="homepage-main">
        <section class="summary-row">
          <ItemCard :user="adminInfo" />

          <CardList
            title="6月统计信息"
            :items="statCards"
          />
        </section>

        <Content />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, reactive, ref, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { HomeFilled, List, Tools } from '@element-plus/icons-vue'

import avatarDefault from '../../assets/images/avatar-default.png'
import Header from '../Layout/Header.vue'
import SidebarMenu from '../Layout/SidebarMenu.vue'
import ItemCard from './ItemCard.vue'
import CardList from './CardList.vue'
import Content from './Content.vue'
import ProfileCenter from '../Profile/ProfileCenter.vue'
import GoodsManagement from '../Goods/GoodsManagement.vue'
import CategoryManagement from '../Category/CategoryManagement.vue'
import {
  changeAvatar,
  changePassword,
  getAdmin,
  getCategoryList,
  getGoodsList,
  uploadPicture,
} from '../../request/api.js'

interface AdminInfo {
  name: string
  avatar: string
  loginTime: string
  location: string
}

interface MenuItem {
  index: string
  label: string
  icon: Component
}

interface StatCard {
  id: string
  label: string
  value: string
  unit: string
}

interface ProfileForm {
  password: string
  confirmPassword: string
}

interface AvatarPayload {
  user: AdminInfo
  file: File | null
  fileName: string
}

type HeaderCommand = 'profile' | 'logout'

const router = useRouter()
const apiBaseUrl = 'http://127.0.0.1:8360'

const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    ' ',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
    ':',
    pad(date.getSeconds()),
  ].join('')
}

const resolveFileUrl = (url?: string) => {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//.test(url) || url.startsWith('blob:')) {
    return url
  }

  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

const normalizeList = (data: unknown): any[] => {
  if (Array.isArray(data)) {
    return data
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  const source = data as Record<string, any>

  return source.list || source.rows || source.data || source.items || []
}

const countSecondLevelCategories = (list: any[]): number => list.reduce((count, item) => {
  const children = item.children || item.child || item.list || []

  if (Array.isArray(children) && children.length) {
    return count + children.length
  }

  const pid = Number(item.pid ?? item.parent_id ?? item.parentId ?? 0)

  return count + (pid ? 1 : 0)
}, 0)

const getUploadedUrl = (data: any) => (
  data?.url || data?.path || data?.src || data?.picture || data?.avatar || data?.file || data
)

const pageTitle = ref<string>('商城后台管理系统')
const activeMenu = ref<string>('home')
const avatarObjectUrl = ref<string>('')
const dashboardStats = reactive({
  goodsStock: 500,
  categoryCount: 20,
  visitCount: Number(localStorage.getItem('adminVisitCount') || 0),
})

const adminInfo = reactive<AdminInfo>({
  name: localStorage.getItem('adminName') || 'admin',
  avatar: avatarDefault,
  loginTime: localStorage.getItem('adminLoginTime') || formatDateTime(new Date()),
  location: '北京',
})

const menuItems = computed<MenuItem[]>(() => [
  {
    index: 'home',
    label: '首页',
    icon: markRaw(HomeFilled),
  },
  {
    index: 'category',
    label: '分类管理',
    icon: markRaw(List),
  },
  {
    index: 'goods',
    label: '商品管理',
    icon: markRaw(List),
  },
  {
    index: 'profile',
    label: '个人中心',
    icon: markRaw(Tools),
  },
])

const statCards = computed<StatCard[]>(() => [
  {
    id: 'goods',
    label: '商品数量(个)',
    value: String(dashboardStats.goodsStock),
    unit: '',
  },
  {
    id: 'category',
    label: '商品分类数量(个)',
    value: String(dashboardStats.categoryCount),
    unit: '',
  },
  {
    id: 'visits',
    label: '用户访问次数(次)',
    value: String(dashboardStats.visitCount),
    unit: '',
  },
])

const isProfilePage = computed<boolean>(() => activeMenu.value === 'profile')
const isGoodsPage = computed<boolean>(() => activeMenu.value === 'goods')
const isCategoryPage = computed<boolean>(() => activeMenu.value === 'category')

const loadAdminInfo = async () => {
  try {
    const data = await getAdmin()

    adminInfo.name = data?.username || data?.name || data?.nickname || adminInfo.name
    adminInfo.avatar = avatarDefault
  } catch {
    adminInfo.avatar = avatarDefault
  }
}

const loadDashboardStats = async () => {
  try {
    const [categoryData, goodsData] = await Promise.all([
      getCategoryList(),
      getGoodsList({
        page: 1,
        pagesize: 1000,
      }),
    ])

    const categories = normalizeList(categoryData)
    const goods = normalizeList(goodsData)

    dashboardStats.categoryCount = countSecondLevelCategories(categories)
    dashboardStats.goodsStock = goods.reduce((total, item) => (
      total + Number(item.stock || 0)
    ), 0)
  } catch {
    dashboardStats.categoryCount = dashboardStats.categoryCount || 20
    dashboardStats.goodsStock = dashboardStats.goodsStock || 500
  }
}

const handleHeaderCommand = (command: HeaderCommand) => {
  if (command === 'profile') {
    activeMenu.value = 'profile'
    return
  }

  localStorage.removeItem('adminName')
  localStorage.removeItem('adminLoginTime')
  localStorage.removeItem('myToken')
  router.push('/login')
}

const handleChooseAvatar = (payload: AvatarPayload) => {
  if (payload.fileName) {
    ElMessage.info(`已选择头像：${payload.fileName}`)
  }
}

const handleUploadAvatar = async (payload: AvatarPayload) => {
  if (!payload.file) {
    ElMessage.warning('请先选择头像')
    return
  }

  try {
    const uploadResult = await uploadPicture('admin_avatar', payload.file)
    const avatarUrl = resolveFileUrl(getUploadedUrl(uploadResult))

    await changeAvatar({
      avatar: avatarUrl,
      picture: avatarUrl,
    })

    adminInfo.avatar = avatarUrl
    ElMessage.success('头像修改完成')
  } catch {
    if (avatarObjectUrl.value) {
      URL.revokeObjectURL(avatarObjectUrl.value)
    }

    avatarObjectUrl.value = URL.createObjectURL(payload.file)
    adminInfo.avatar = avatarObjectUrl.value
  }
}

const handleProfileSubmit = async (form: ProfileForm) => {
  if (!form.password || !form.confirmPassword) {
    ElMessage.warning('请输入密码')
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  try {
    await changePassword({
      password: form.password,
    })
    ElMessage.success('个人信息修改成功')
  } catch {
    ElMessage.error('密码修改失败')
  }
}

onMounted(() => {
  dashboardStats.visitCount += 1
  localStorage.setItem('adminVisitCount', String(dashboardStats.visitCount))
  loadAdminInfo()
  loadDashboardStats()
})
</script>

<style scoped>
.admin-layout {
  --topbar-height: clamp(38px, 3.67vw, 70px);
  --sidebar-width: clamp(132px, 11.69vw, 223px);
  --menu-item-height: clamp(37px, 3.3vw, 63px);
  --menu-item-padding: clamp(16px, 1.26vw, 24px);
  --menu-icon-gap: clamp(8px, 0.63vw, 12px);

  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #e8edf2;
}

.page-body {
  height: calc(100vh - var(--topbar-height));
  display: flex;
  overflow: hidden;
}

.homepage-main {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 22px 24px;
  overflow: hidden;
  background: #e8edf2;
  box-shadow: inset 0 0 18px rgba(37, 57, 83, 0.18);
}

.summary-row {
  display: grid;
  grid-template-columns: 384px 1fr;
  gap: 22px;
  flex: 0 0 221px;
  min-width: 0;
}
</style>
