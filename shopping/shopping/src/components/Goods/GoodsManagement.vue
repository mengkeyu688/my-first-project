<!-- 商品管理页面组件 -->
<template>
  <main class="goods-page">
    <section class="goods-panel">
      <el-button
        class="add-button"
        type="primary"
        size="small"
        @click="openAddDialog"
      >
        新增商品
      </el-button>

      <el-table
        class="goods-table"
        :data="currentPageGoods"
        border
        table-layout="fixed"
      >
        <el-table-column
          prop="id"
          label="商品编号"
          width="136"
        />
        <el-table-column
          prop="name"
          label="商品名称"
          min-width="170"
        />
        <el-table-column
          prop="price"
          label="商品价格"
          width="126"
        />
        <el-table-column
          prop="stock"
          label="商品库存"
          width="126"
        />
        <el-table-column
          label="商品简介"
          min-width="340"
        >
          <template #default="{ row }">
            <div class="description-cell">
              {{ formatDescription(row.description) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="商品图片"
          width="140"
          align="center"
        >
          <template #default="{ row }">
            <img
              v-if="row.picture"
              class="product-thumb"
              :src="row.picture"
              :alt="row.name"
            >
            <div
              v-else
              class="product-image"
              :class="row.imageType"
              :aria-label="row.name"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="190"
          align="center"
        >
          <template #default="{ row }">
            <div class="action-buttons">
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
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="goods-pagination"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        size="small"
        @current-change="handlePageChange"
      />
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      class="goods-dialog"
      width="960px"
      top="2vh"
      draggable
      destroy-on-close
    >
      <el-form
        class="goods-form"
        :model="goodsForm"
        label-width="76px"
      >
        <el-form-item label="商品名称">
          <el-input
            v-model="goodsForm.name"
            placeholder="请填写商品名称"
          />
        </el-form-item>

        <el-form-item label="分类名称">
          <el-select
            v-model="goodsForm.categoryId"
            class="category-select"
            placeholder="请选择一级分类名称"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品价格">
          <el-input
            v-model="goodsForm.price"
            placeholder="请填写商品价格"
          />
        </el-form-item>

        <el-form-item label="商品图片">
          <el-upload
            class="upload-box"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleImageChange"
          >
            <el-button type="primary" size="small">选择图片</el-button>
          </el-upload>
          <p class="upload-tip">图片文件大小不超过500KB</p>
        </el-form-item>

        <el-form-item label="图片相册">
          <el-upload
            class="album-uploader"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleAlbumChange"
          >
            <div class="album-placeholder">+</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品库存">
          <el-input
            v-model="goodsForm.stock"
            placeholder="请填写库存数量"
          />
        </el-form-item>

        <el-form-item label="商品规格">
          <el-input
            v-model="goodsForm.specification"
            placeholder="请填写商品规格"
          />
        </el-form-item>

        <el-form-item label="商品简介">
          <div class="editor-box">
            <div class="editor-toolbar">
              <button type="button">B</button>
              <button type="button">U</button>
              <button type="button">I</button>
              <button type="button">S</button>
              <button type="button">□</button>
              <button type="button">↶</button>
              <button type="button">↷</button>
            </div>
            <el-input
              v-model="goodsForm.description"
              type="textarea"
              resize="none"
            />
          </div>
        </el-form-item>

        <el-form-item class="dialog-actions">
          <el-button type="primary" size="small" @click="handleSubmit">
            {{ dialogMode === 'add' ? '新增' : '修改' }}
          </el-button>
          <el-button size="small" @click="resetForm">重置</el-button>
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
  addGoods,
  deleteGoods,
  getCategoryList,
  getGoods,
  getGoodsList,
  saveGoods,
  uploadPicture,
} from '../../request/api.js'

interface ProductItem {
  id: number
  name: string
  categoryId: number | ''
  price: number
  stock: number
  specification?: string
  description: string
  imageType: 'apple' | 'pear' | 'default'
  picture?: string
  imageName?: string
  albumName?: string
  album?: string[]
}

interface GoodsForm {
  name: string
  categoryId: number | ''
  price: string
  stock: string
  specification: string
  description: string
  imageType: 'apple' | 'pear' | 'default'
  picture: string
  imageName: string
  album: string[]
  albumName: string
}

interface CategoryOption {
  id: number
  name: string
}

const currentPage = ref<number>(1)
const pageSize = ref<number>(2)
const total = ref<number>(10)
const dialogVisible = ref<boolean>(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const pictureFile = ref<File | null>(null)
const albumFile = ref<File | null>(null)
const apiBaseUrl = 'http://127.0.0.1:8360'

const categoryOptions = ref<CategoryOption[]>([
  {
    id: 1,
    name: '水果',
  },
  {
    id: 2,
    name: '服饰',
  },
  {
    id: 3,
    name: '数码',
  },
  {
    id: 4,
    name: '家居',
  },
])

const goodsForm = reactive<GoodsForm>({
  name: '',
  categoryId: '',
  price: '',
  stock: '',
  specification: '',
  description: '',
  imageType: 'default',
  picture: '',
  imageName: '',
  album: [],
  albumName: '',
})

const goodsList = ref<ProductItem[]>([
  {
    id: 10,
    name: '加力果',
    categoryId: 1,
    price: 26.8,
    stock: 19,
    description: '加力果属于苹果的一种，只是普通水果，功效主要是提供营养物质。另外加力果富含膳食纤维，还具有预防和改善便秘的作用。',
    imageType: 'apple',
    imageName: 'apple.png',
    albumName: 'apple-album.png',
  },
  {
    id: 9,
    name: '陕西面梨',
    categoryId: 1,
    price: 6.9,
    stock: 30,
    description: '梨味美汁多、甜中带酸，而且营养丰富，含有多种维生素、纤维素等，既能生吃，也可以煮水或煲汤后食用。',
    imageType: 'pear',
    imageName: 'pear.png',
    albumName: 'pear-album.png',
  },
  {
    id: 8,
    name: '男士外套',
    categoryId: 2,
    price: 168,
    stock: 42,
    description: '简约日常外套，面料柔软，适合春秋季通勤穿着。',
    imageType: 'default',
    imageName: 'coat.png',
  },
  {
    id: 7,
    name: '无线耳机',
    categoryId: 3,
    price: 299,
    stock: 25,
    description: '低延迟无线耳机，续航稳定，适合日常听歌和视频会议。',
    imageType: 'default',
    imageName: 'earphone.png',
  },
  {
    id: 6,
    name: '收纳盒',
    categoryId: 4,
    price: 39.9,
    stock: 66,
    description: '透明收纳盒，容量适中，可用于桌面和衣柜整理。',
    imageType: 'default',
    imageName: 'box.png',
  },
  {
    id: 5,
    name: '运动鞋',
    categoryId: 2,
    price: 219,
    stock: 18,
    description: '轻量运动鞋，鞋底柔软，适合日常慢跑和步行。',
    imageType: 'default',
    imageName: 'shoes.png',
  },
  {
    id: 4,
    name: '台灯',
    categoryId: 4,
    price: 89,
    stock: 34,
    description: '护眼台灯，多档亮度调节，适合学习与办公。',
    imageType: 'default',
    imageName: 'lamp.png',
  },
  {
    id: 3,
    name: '蓝牙音箱',
    categoryId: 3,
    price: 159,
    stock: 20,
    description: '便携蓝牙音箱，体积小巧，户外和室内均可使用。',
    imageType: 'default',
    imageName: 'speaker.png',
  },
  {
    id: 2,
    name: '抱枕',
    categoryId: 4,
    price: 35,
    stock: 80,
    description: '柔软抱枕，触感舒适，适合沙发和卧室搭配。',
    imageType: 'default',
    imageName: 'pillow.png',
  },
  {
    id: 1,
    name: '短袖T恤',
    categoryId: 2,
    price: 59,
    stock: 55,
    description: '纯色短袖T恤，版型简洁，适合夏季日常搭配。',
    imageType: 'default',
    imageName: 'shirt.png',
  },
])

const currentPageGoods = computed<ProductItem[]>(() => {
  if (goodsList.value.length <= pageSize.value) {
    return goodsList.value
  }

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return goodsList.value.slice(start, end)
})

const dialogTitle = computed<string>(() => (
  dialogMode.value === 'add' ? '新增商品' : '修改商品'
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

const normalizeTotal = (data: unknown, fallback: number) => {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  const source = data as Record<string, any>

  return Number(source.total ?? source.count ?? source.pagesizeTotal ?? fallback)
}

const getUploadedUrl = (data: any) => (
  data?.url || data?.path || data?.src || data?.picture || data?.file || data
)

const formatDescription = (value: string) => {
  if (!value) {
    return ''
  }

  const withoutImages = String(value).replace(/<img\b[^>]*>/gi, ' ')
  const withoutTags = withoutImages.replace(/<[^>]+>/g, ' ')

  const textarea = document.createElement('textarea')

  textarea.innerHTML = withoutTags

  return textarea.value.replace(/\s+/g, ' ').trim()
}

const mapProduct = (item: any): ProductItem => ({
  id: Number(item.id),
  name: item.name || '',
  categoryId: Number(item.category_id ?? item.categoryId ?? item.category ?? ''),
  price: Number(item.price || 0),
  stock: Number(item.stock || 0),
  specification: item.spec || item.specification || '',
  description: item.description || '',
  imageType: item.name?.includes('梨') ? 'pear' : (item.name?.includes('果') ? 'apple' : 'default'),
  picture: resolveFileUrl(item.picture || item.image || item.img),
  imageName: item.picture || item.image || '',
  album: Array.isArray(item.album) ? item.album.map(resolveFileUrl) : [],
  albumName: Array.isArray(item.album) ? item.album.join(',') : '',
})

const mapCategoryOptions = (list: any[]) => {
  const options: CategoryOption[] = []

  const walk = (items: any[]) => {
    items.forEach((item) => {
      const children = normalizeList(item.children || item.child || item.list)
      const pid = Number(item.pid ?? item.parent_id ?? item.parentId ?? 0)

      if (children.length) {
        walk(children)
        return
      }

      if (pid || !children.length) {
        options.push({
          id: Number(item.id),
          name: item.name || item.category_name || '',
        })
      }
    })
  }

  walk(list)

  return options.filter((item) => item.id && item.name)
}

const loadCategoryOptions = async () => {
  try {
    const data = await getCategoryList()
    const options = mapCategoryOptions(normalizeList(data))

    if (options.length) {
      categoryOptions.value = options
    }
  } catch {
    // 后端未启动时使用本地分类下拉数据。
  }
}

const loadGoodsList = async () => {
  try {
    const data = await getGoodsList({
      page: currentPage.value,
      pagesize: pageSize.value,
    })
    const list = normalizeList(data)

    if (list.length) {
      goodsList.value = list.map(mapProduct)
    }

    total.value = normalizeTotal(data, goodsList.value.length)
  } catch {
    const fallbackStart = (currentPage.value - 1) * pageSize.value
    const fallback = goodsList.value.slice(fallbackStart, fallbackStart + pageSize.value)

    goodsList.value = fallback.length ? fallback : goodsList.value.slice(0, pageSize.value)
    total.value = Math.max(total.value, 10)
  }
}

const resetForm = () => {
  goodsForm.name = ''
  goodsForm.categoryId = ''
  goodsForm.price = ''
  goodsForm.stock = ''
  goodsForm.specification = ''
  goodsForm.description = ''
  goodsForm.imageType = 'default'
  goodsForm.picture = ''
  goodsForm.imageName = ''
  goodsForm.album = []
  goodsForm.albumName = ''
  pictureFile.value = null
  albumFile.value = null
  editingId.value = null
}

const openAddDialog = () => {
  resetForm()
  dialogMode.value = 'add'
  dialogVisible.value = true
}

const openEditDialog = async (goods: ProductItem) => {
  resetForm()
  dialogMode.value = 'edit'
  editingId.value = goods.id
  let target = goods

  try {
    const data = await getGoods(goods.id)
    target = mapProduct(data)
  } catch {
    target = goods
  }

  goodsForm.name = target.name
  goodsForm.categoryId = target.categoryId
  goodsForm.price = String(target.price)
  goodsForm.stock = String(target.stock)
  goodsForm.specification = target.specification || ''
  goodsForm.description = target.description
  goodsForm.imageType = target.imageType
  goodsForm.picture = target.picture || ''
  goodsForm.imageName = target.imageName || ''
  goodsForm.album = target.album || []
  goodsForm.albumName = target.albumName || ''
  dialogVisible.value = true
}

const handleImageChange = (uploadFile: UploadFile) => {
  goodsForm.imageName = uploadFile.name
  goodsForm.imageType = goodsForm.name.includes('梨') ? 'pear' : 'apple'
  pictureFile.value = uploadFile.raw || null
}

const handleAlbumChange = (uploadFile: UploadFile) => {
  goodsForm.albumName = uploadFile.name
  albumFile.value = uploadFile.raw || null
}

const validateForm = () => {
  if (!goodsForm.name.trim()) {
    ElMessage.warning('请输入商品名称')
    return false
  }

  if (!goodsForm.categoryId) {
    ElMessage.warning('请选择分类名称')
    return false
  }

  if (!goodsForm.price) {
    ElMessage.warning('请输入商品价格')
    return false
  }

  if (!goodsForm.stock) {
    ElMessage.warning('请输入库存数量')
    return false
  }

  return true
}

const uploadGoodsImages = async () => {
  let picture = goodsForm.picture
  const album = [...goodsForm.album]

  if (pictureFile.value) {
    const uploadResult = await uploadPicture('goods_picture', pictureFile.value)

    picture = resolveFileUrl(getUploadedUrl(uploadResult))
  }

  if (albumFile.value) {
    const uploadResult = await uploadPicture('goods_album', albumFile.value)

    album.push(resolveFileUrl(getUploadedUrl(uploadResult)))
  }

  return {
    picture,
    album,
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const { picture, album } = await uploadGoodsImages()
    const params = {
      category_id: goodsForm.categoryId,
      name: goodsForm.name,
      price: Number(goodsForm.price),
      description: goodsForm.description,
      picture,
      spec: goodsForm.specification,
      stock: Number(goodsForm.stock),
      album,
    }

    if (dialogMode.value === 'add') {
      currentPage.value = 1
      await addGoods(params)
    } else if (editingId.value) {
      await saveGoods({
        id: editingId.value,
        ...params,
      })
    }

    await loadGoodsList()
    ElMessage.success(dialogMode.value === 'add' ? '新增商品成功' : '修改商品成功')
    dialogVisible.value = false
  } catch {
    if (dialogMode.value === 'add') {
      goodsList.value.unshift({
        id: Math.max(...goodsList.value.map((item) => item.id)) + 1,
        name: goodsForm.name,
        categoryId: goodsForm.categoryId,
        price: Number(goodsForm.price),
        stock: Number(goodsForm.stock),
        specification: goodsForm.specification,
        description: goodsForm.description,
        imageType: goodsForm.imageType,
        picture: goodsForm.picture,
        imageName: goodsForm.imageName,
        album: goodsForm.album,
        albumName: goodsForm.albumName,
      })
      currentPage.value = 1
    }

    if (dialogMode.value === 'edit' && editingId.value) {
      const target = goodsList.value.find((item) => item.id === editingId.value)

      if (target) {
        target.name = goodsForm.name
        target.categoryId = goodsForm.categoryId
        target.price = Number(goodsForm.price)
        target.stock = Number(goodsForm.stock)
        target.specification = goodsForm.specification
        target.description = goodsForm.description
        target.imageType = goodsForm.imageType
        target.picture = goodsForm.picture
        target.imageName = goodsForm.imageName
        target.album = goodsForm.album
        target.albumName = goodsForm.albumName
      }
    }

    dialogVisible.value = false
  }
}

const handleDelete = async (goods: ProductItem) => {
  try {
    await ElMessageBox.confirm('确定删除该商品吗？', '删除提示', {
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
    await deleteGoods(goods.id)
    await loadGoodsList()
    ElMessage.success('删除成功')
  } catch {
    goodsList.value = goodsList.value.filter((item) => item.id !== goods.id)

    const maxPage = Math.max(1, Math.ceil(goodsList.value.length / pageSize.value))

    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadGoodsList()
}

onMounted(() => {
  loadCategoryOptions()
  loadGoodsList()
})
</script>

<style scoped>
.goods-page {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 20px 23px;
  overflow: hidden;
  background: #e8edf2;
  box-shadow: inset 0 0 18px rgba(37, 57, 83, 0.18);
}

.goods-panel {
  width: 100%;
  min-height: 426px;
  padding: 24px 22px;
  overflow: hidden;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(37, 57, 83, 0.18);
}

.add-button {
  min-width: 99px;
  height: 36px;
  margin-bottom: 11px;
  padding: 0 18px;
  border-radius: 3px;
  font-size: 14px;
}

.goods-table {
  width: 100%;
  color: #606266;
  font-size: 16px;
}

.goods-table :deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
}

.goods-table :deep(.el-scrollbar__bar.is-horizontal) {
  display: none !important;
}

.goods-table :deep(.cell) {
  word-break: break-word;
}

.goods-table :deep(.el-table__header-wrapper th) {
  height: 44px;
  color: #606266;
  font-size: 16px;
  font-weight: 700;
  background: #ffffff;
}

.goods-table :deep(.el-table__header .cell) {
  white-space: nowrap;
  word-break: keep-all;
}

.goods-table :deep(.el-table__cell) {
  padding: 11px 14px;
  border-color: #ebeef5;
}

.goods-table :deep(.el-table__row) {
  height: 88px;
}

.description-cell {
  display: -webkit-box;
  max-height: 72px;
  overflow: hidden;
  color: #303133;
  line-height: 24px;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  white-space: nowrap;
}

.product-image {
  position: relative;
  width: 68px;
  height: 68px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 2px;
  background: linear-gradient(135deg, #f8fbff 0%, #d8eef8 100%);
}

.product-thumb {
  width: 68px;
  height: 68px;
  display: block;
  margin: 0 auto;
  border-radius: 2px;
  object-fit: cover;
}

.product-image::before,
.product-image::after {
  position: absolute;
  content: '';
  border-radius: 50%;
}

.product-image.apple {
  background:
    radial-gradient(circle at 70% 26%, #ffd9a9 0 10px, transparent 11px),
    linear-gradient(135deg, #ffebe6 0%, #f5f7fb 100%);
}

.product-image.apple::before {
  width: 31px;
  height: 34px;
  left: 14px;
  bottom: 12px;
  background: radial-gradient(circle at 36% 34%, #ff7770 0 3px, #de1f25 4px 100%);
  box-shadow: 18px 3px 0 #c91920;
}

.product-image.apple::after {
  width: 18px;
  height: 6px;
  top: 15px;
  left: 34px;
  border-radius: 8px 8px 0 8px;
  background: #5aa144;
  transform: rotate(-25deg);
}

.product-image.pear {
  background:
    radial-gradient(circle at 74% 22%, #56aee8 0 11px, transparent 12px),
    linear-gradient(135deg, #fef9e2 0%, #e7f7fb 100%);
}

.product-image.pear::before {
  width: 32px;
  height: 36px;
  left: 12px;
  bottom: 11px;
  background: radial-gradient(circle at 35% 35%, #fff4be 0 4px, #e6bf65 5px 100%);
  box-shadow: 19px 5px 0 #d9a952;
}

.product-image.pear::after {
  width: 14px;
  height: 4px;
  top: 15px;
  left: 30px;
  border-radius: 6px;
  background: #8a6a29;
  transform: rotate(-48deg);
}

.product-image.default::before {
  width: 38px;
  height: 30px;
  left: 15px;
  bottom: 15px;
  border-radius: 4px;
  background: #55acee;
}

.product-image.default::after {
  width: 16px;
  height: 16px;
  top: 14px;
  left: 26px;
  background: #f6c85f;
}

.edit-button,
.delete-button {
  min-width: 68px;
  height: 36px;
  margin: 0;
  padding: 0 16px;
  border-radius: 3px;
  font-size: 14px;
}

.goods-pagination {
  margin-top: 22px;
}

.goods-pagination :deep(.el-pager li),
.goods-pagination :deep(.btn-prev),
.goods-pagination :deep(.btn-next) {
  min-width: 36px;
  height: 36px;
  margin: 0 8px 0 0;
  border-radius: 2px;
  color: #606266;
  background: #f4f6f8;
  font-size: 16px;
}

.goods-pagination :deep(.el-pager li.is-active) {
  color: #ffffff;
  background: #409eff;
}

.goods-form {
  padding: 0 0 4px;
}

.goods-form :deep(.el-form-item) {
  margin-bottom: 11px;
}

.goods-form :deep(.el-form-item__label) {
  height: 20px;
  color: #303133;
  font-size: 12px;
  line-height: 20px;
}

.goods-form :deep(.el-form-item__content) {
  line-height: 20px;
}

.goods-form :deep(.el-input__wrapper) {
  height: 20px;
  min-height: 20px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.goods-form :deep(.el-input__inner) {
  height: 20px;
  font-size: 12px;
}

.goods-form :deep(.el-select__wrapper) {
  height: 20px;
  min-height: 20px;
  border-radius: 0;
  font-size: 12px;
}

.form-control {
  width: 100%;
}

.category-select {
  width: 132px;
}

.upload-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.upload-box :deep(.el-button) {
  min-width: 56px;
  height: 20px;
  padding: 0 8px;
  border-radius: 2px;
  font-size: 12px;
}

.upload-box :deep(.el-upload-list__item-name) {
  max-width: 320px;
}

.upload-tip {
  width: 100%;
  margin: 7px 0 0;
  color: #606266;
  font-size: 11px;
  line-height: 1.2;
}

.album-uploader {
  display: inline-block;
}

.album-placeholder {
  width: 92px;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #b9c1cc;
  border-radius: 4px;
  color: #909399;
  background: #ffffff;
  font-size: 28px;
  line-height: 1;
}

.editor-box {
  width: 100%;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #ffffff;
}

.editor-toolbar {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-bottom: 1px solid #ebeef5;
  background: #ffffff;
}

.editor-toolbar button {
  min-width: 12px;
  height: 20px;
  padding: 0;
  border: 0;
  color: #1f2d3d;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.editor-box :deep(.el-textarea__inner) {
  height: 217px;
  min-height: 217px;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  font-size: 12px;
}

.dialog-actions {
  margin-top: -2px;
}

.dialog-actions :deep(.el-button) {
  min-width: 39px;
  height: 22px;
  padding: 0 10px;
  border-radius: 3px;
  font-size: 12px;
}

:global(.goods-dialog.el-dialog) {
  max-width: calc(100vw - 48px);
  border-radius: 0;
  box-shadow: none;
}

:global(.goods-dialog .el-dialog__header) {
  height: 36px;
  padding: 11px 10px 0;
  margin-right: 0;
}

:global(.goods-dialog .el-dialog__title) {
  color: #303133;
  font-size: 12px;
  font-weight: normal;
}

:global(.goods-dialog .el-dialog__headerbtn) {
  display: none;
}

:global(.goods-dialog .el-dialog__body) {
  padding: 12px 43px 25px;
}
</style>
