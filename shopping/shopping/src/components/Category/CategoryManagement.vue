<!-- 分类管理页面组件 -->
<template>
  <main class="category-page">
    <section class="category-panel">
      <el-button
        class="add-button"
        type="primary"
        size="small"
        @click="openAddDialog"
      >
        新增分类
      </el-button>

      <el-table
        class="category-table"
        :data="categoryList"
        row-key="id"
        border
        size="small"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column
          prop="name"
          label="分类名称"
          min-width="220"
        />
        <el-table-column
          label="分类级别"
          width="120"
        >
          <template #default="{ row }">
            {{ row.level === 1 ? '一级分类' : '二级分类' }}
          </template>
        </el-table-column>
        <el-table-column
          label="分类图片"
          width="130"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.level === 1" class="empty-image">-</span>
            <img
              v-else-if="row.picture"
              class="category-thumb"
              :src="row.picture"
              :alt="row.name"
            >
            <span v-else class="category-image">{{ row.imageName || '分类图片' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              class="edit-button"
              type="warning"
              size="small"
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              class="delete-button"
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      class="category-dialog"
      width="435px"
      top="4px"
      :show-close="false"
      draggable
      destroy-on-close
    >
      <el-form
        class="category-form"
        :model="categoryForm"
        label-width="78px"
      >
        <el-form-item label="分类名称">
          <el-input
            v-model="categoryForm.name"
            class="form-control"
            placeholder="请输入分类名称"
          />
        </el-form-item>

        <el-form-item label="二级分类">
          <el-radio-group v-model="categoryForm.isChild">
            <el-radio value="yes">是</el-radio>
            <el-radio value="no">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="categoryForm.isChild === 'yes'"
          label="上级分类"
        >
          <el-select
            v-model="categoryForm.parentId"
            placeholder="请选择上级分类"
            class="form-control"
          >
            <el-option
              v-for="item in firstLevelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="categoryForm.isChild === 'yes'"
          label="分类图片"
        >
          <el-upload
            class="upload-box"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleImageChange"
          >
            <el-button type="primary" size="small">选择图片</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item class="dialog-actions">
          <el-button type="primary" @click="handleSubmit">
            {{ dialogMode === 'add' ? '新增' : '修改' }}
          </el-button>
          <el-button @click="resetDialogForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
  addCategory,
  deleteCategory,
  getCategory,
  getCategoryList,
  saveCategory,
  uploadPicture,
} from '../../request/api.js'

interface CategoryItem {
  id: number
  name: string
  level: 1 | 2
  imageName?: string
  picture?: string
  pid?: number
  children?: CategoryItem[]
}

interface CategoryForm {
  name: string
  isChild: 'yes' | 'no'
  parentId: number | ''
  imageName: string
  picture: string
}

const dialogVisible = ref<boolean>(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const categoryImageFile = ref<File | null>(null)
const apiBaseUrl = 'http://127.0.0.1:8360'

const categoryForm = reactive<CategoryForm>({
  name: '',
  isChild: 'no',
  parentId: '',
  imageName: '',
  picture: '',
})

const categoryList = ref<CategoryItem[]>([
  {
    id: 1,
    name: '水果',
    level: 1,
    children: [
      {
        id: 11,
        name: '苹果',
        level: 2,
        imageName: 'apple.png',
        picture: '',
        pid: 1,
      },
      {
        id: 12,
        name: '梨',
        level: 2,
        imageName: 'pear.png',
        picture: '',
        pid: 1,
      },
    ],
  },
  {
    id: 2,
    name: '服饰',
    level: 1,
    children: [
      {
        id: 21,
        name: '上衣',
        level: 2,
        imageName: 'clothes.png',
        picture: '',
        pid: 2,
      },
    ],
  },
])

const firstLevelOptions = computed<CategoryItem[]>(() => categoryList.value)

const dialogTitle = computed<string>(() => (
  dialogMode.value === 'add' ? '新增分类' : '修改分类'
))

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

const mapCategoryItem = (item: any): CategoryItem => {
  const pid = Number(item.pid ?? item.parent_id ?? item.parentId ?? 0)
  const children = normalizeList(item.children || item.child || item.list)
  const picture = resolveFileUrl(item.picture || item.image || item.img)

  return {
    id: Number(item.id),
    name: item.name || item.category_name || '',
    level: pid ? 2 : 1,
    pid,
    imageName: item.picture || item.image || '',
    picture,
    children: children.map(mapCategoryItem),
  }
}

const buildCategoryTree = (list: any[]) => {
  const mapped = list.map(mapCategoryItem)
  const hasFlatPid = mapped.some((item) => item.pid)

  if (!hasFlatPid) {
    return mapped
  }

  const map = new Map<number, CategoryItem>()
  const roots: CategoryItem[] = []

  mapped.forEach((item) => {
    item.children = []
    map.set(item.id, item)
  })

  mapped.forEach((item) => {
    if (item.pid && map.has(item.pid)) {
      item.level = 2
      map.get(item.pid)?.children?.push(item)
      return
    }

    item.level = 1
    roots.push(item)
  })

  return roots
}

const getUploadedUrl = (data: any) => (
  data?.url || data?.path || data?.src || data?.picture || data?.file || data
)

const resetForm = () => {
  categoryForm.name = ''
  categoryForm.isChild = 'no'
  categoryForm.parentId = ''
  categoryForm.imageName = ''
  categoryForm.picture = ''
  categoryImageFile.value = null
  editingId.value = null
}

const resetDialogForm = () => {
  const mode = dialogMode.value
  const id = editingId.value

  resetForm()
  dialogMode.value = mode
  editingId.value = id
}

const createId = () => Date.now()

const findCategory = (
  list: CategoryItem[],
  id: number,
  parent: CategoryItem | null = null,
): { item: CategoryItem, parent: CategoryItem | null } | null => {
  for (const item of list) {
    if (item.id === id) {
      return {
        item,
        parent,
      }
    }

    if (item.children?.length) {
      const result = findCategory(item.children, id, item)

      if (result) {
        return result
      }
    }
  }

  return null
}

const removeCategory = (list: CategoryItem[], id: number): boolean => {
  const index = list.findIndex((item) => item.id === id)

  if (index > -1) {
    list.splice(index, 1)
    return true
  }

  return list.some((item) => (
    item.children ? removeCategory(item.children, id) : false
  ))
}

const loadCategoryList = async () => {
  try {
    const data = await getCategoryList()
    const list = normalizeList(data)

    if (list.length) {
      categoryList.value = buildCategoryTree(list)
    }
  } catch {
    // 后端未启动时保留本地示例数据，页面仍然可以运行。
  }
}

const openAddDialog = () => {
  resetForm()
  dialogMode.value = 'add'
  dialogVisible.value = true
}

const openEditDialog = async (row: CategoryItem) => {
  resetForm()
  dialogMode.value = 'edit'
  editingId.value = row.id
  let target = row

  try {
    const data = await getCategory(row.id)
    target = mapCategoryItem(data)
  } catch {
    target = row
  }

  categoryForm.name = target.name
  categoryForm.isChild = target.level === 2 ? 'yes' : 'no'
  categoryForm.imageName = target.imageName || ''
  categoryForm.picture = target.picture || ''

  const result = findCategory(categoryList.value, row.id)

  if (result?.parent) {
    categoryForm.parentId = result.parent.id
  } else if (target.pid) {
    categoryForm.parentId = target.pid
  }

  dialogVisible.value = true
}

const handleImageChange = (uploadFile: UploadFile) => {
  categoryForm.imageName = uploadFile.name
  categoryImageFile.value = uploadFile.raw || null
}

const uploadCategoryImage = async () => {
  if (!categoryImageFile.value) {
    return categoryForm.picture
  }

  const uploadResult = await uploadPicture('category_picture', categoryImageFile.value)
  const picture = resolveFileUrl(getUploadedUrl(uploadResult))

  categoryForm.picture = picture

  return picture
}

const handleSubmit = async () => {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  if (categoryForm.isChild === 'yes' && !categoryForm.parentId) {
    ElMessage.warning('请选择上级分类')
    return
  }

  const pid = categoryForm.isChild === 'yes' ? Number(categoryForm.parentId) : 0
  let picture = categoryForm.picture

  if (categoryForm.isChild === 'yes') {
    try {
      picture = await uploadCategoryImage()
    } catch {
      ElMessage.error('分类图片上传失败')
      return
    }
  }

  try {
    if (categoryForm.isChild === 'yes') {
      const parent = categoryList.value.find((item) => item.id === categoryForm.parentId)

      if (!parent) {
        ElMessage.warning('上级分类不存在')
        return
      }
    }

    const params = {
      name: categoryForm.name,
      picture,
      pid,
    }

    if (dialogMode.value === 'add') {
      await addCategory(params)
    } else if (editingId.value) {
      await saveCategory({
        id: editingId.value,
        ...params,
      })
    }

    await loadCategoryList()
    ElMessage.success(dialogMode.value === 'add' ? '新增分类成功' : '修改分类成功')
    dialogVisible.value = false
  } catch {
    if (dialogMode.value === 'add') {
      if (categoryForm.isChild === 'yes') {
        const parent = categoryList.value.find((item) => item.id === categoryForm.parentId)

        parent?.children?.push({
          id: createId(),
          name: categoryForm.name,
          level: 2,
          imageName: categoryForm.imageName || 'category.png',
          picture,
          pid,
        })
      } else {
        categoryList.value.push({
          id: createId(),
          name: categoryForm.name,
          level: 1,
          children: [],
        })
      }
    }

    if (dialogMode.value === 'edit' && editingId.value) {
      const result = findCategory(categoryList.value, editingId.value)

      if (result) {
        result.item.name = categoryForm.name
        result.item.imageName = categoryForm.imageName || result.item.imageName
        result.item.picture = picture || result.item.picture
      }
    }

    dialogVisible.value = false
  }
}

const handleDelete = async (row: CategoryItem) => {
  if (row.level === 1 && row.children?.length) {
    ElMessage.warning('请先删除所有二级分类')
    return
  }

  try {
    await ElMessageBox.confirm('确定删除该分类吗？', '删除提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      draggable: true,
    })
  } catch {
    ElMessage.info('已取消删除')
    return
  }

  try {
    await deleteCategory(row.id)
    await loadCategoryList()
    ElMessage.success('删除成功')
  } catch {
    removeCategory(categoryList.value, row.id)
  }
}

onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.category-page {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 14px;
  overflow: hidden;
  background: #e8edf2;
  box-shadow: inset 0 0 18px rgba(37, 57, 83, 0.18);
}

.category-panel {
  width: 100%;
  min-height: 248px;
  padding: 14px;
  overflow: hidden;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(37, 57, 83, 0.18);
}

.add-button {
  min-width: 58px;
  height: 22px;
  margin-bottom: 8px;
  padding: 0 10px;
  border-radius: 3px;
  font-size: 12px;
}

.category-table {
  width: 100%;
  color: #606266;
  font-size: 12px;
}

.category-table :deep(.el-table__header-wrapper th) {
  height: 30px;
  color: #606266;
  font-size: 12px;
  font-weight: normal;
  background: #ffffff;
}

.category-table :deep(.el-table__cell) {
  padding: 6px 8px;
  border-color: #ebeef5;
}

.empty-image {
  color: #909399;
}

.category-image {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 28px;
  overflow: hidden;
  border-radius: 3px;
  color: #409eff;
  background: #eef6ff;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.category-thumb {
  width: 42px;
  height: 32px;
  display: block;
  margin: 0 auto;
  border-radius: 3px;
  object-fit: cover;
}

.edit-button,
.delete-button {
  min-width: 38px;
  height: 22px;
  margin: 0 3px;
  padding: 0 9px;
  border-radius: 3px;
  font-size: 12px;
}

.category-form {
  width: 310px;
  margin: 0 auto;
  padding: 0;
}

.form-control {
  width: 100%;
}

.category-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.category-form :deep(.el-form-item__label) {
  height: 34px;
  color: #606266;
  font-size: 16px;
  font-weight: normal;
  line-height: 34px;
}

.category-form :deep(.el-form-item__content) {
  min-height: 34px;
  line-height: 34px;
}

.category-form :deep(.el-input__wrapper),
.category-form :deep(.el-select__wrapper) {
  height: 34px;
  min-height: 34px;
  border-radius: 3px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.category-form :deep(.el-input__inner) {
  height: 34px;
  color: #606266;
  font-size: 16px;
}

.category-form :deep(.el-radio) {
  height: 34px;
  margin-right: 28px;
  color: #909399;
  font-size: 16px;
}

.category-form :deep(.el-radio__label) {
  padding-left: 8px;
  font-size: 16px;
}

.category-form :deep(.el-radio__inner) {
  width: 16px;
  height: 16px;
}

.dialog-actions {
  margin-top: 2px;
  margin-bottom: 0 !important;
}

.dialog-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 12px;
}

.dialog-actions :deep(.el-button) {
  min-width: 67px;
  height: 36px;
  padding: 0 18px;
  border-radius: 4px;
  font-size: 16px;
}

.upload-box :deep(.el-upload-list__item-name) {
  max-width: 240px;
}

:global(.category-dialog.el-dialog) {
  border-radius: 0;
  box-shadow: none;
}

:global(.category-dialog .el-dialog__header) {
  height: 74px;
  padding: 28px 22px 0;
  margin: 0;
}

:global(.category-dialog .el-dialog__title) {
  color: #303133;
  font-size: 20px;
  font-weight: normal;
}

:global(.category-dialog .el-dialog__body) {
  padding: 19px 0 47px;
}
</style>
