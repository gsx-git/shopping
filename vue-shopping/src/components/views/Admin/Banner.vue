<template>
    <div class="banner-manage">
        <!-- 搜索/筛选栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchBanners">
                <el-form-item label="轮播图名称">
                    <el-input v-model="searchForm.title" placeholder="请输入名称" clearable style="width: 200px" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="fetchBanners">
                        <el-icon>
                            <Search />
                        </el-icon> 搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon>
                            <Refresh />
                        </el-icon> 重置
                    </el-button>
                    <el-button type="success" @click="openAdd">
                        <el-icon>
                            <Plus />
                        </el-icon> 新增
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 数据表格 -->
        <el-card class="table-card">
            <template #header>
                <div class="table-header"><span>轮播图列表</span></div>
            </template>

            <el-table :data="bannerList" stripe v-loading="loading" style="width: 100%">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="title" label="标题" min-width="160" />
                <el-table-column label="图片" min-width="120">
                    <template #default="scope">
                        <el-image :src="scope.row.image" fit="cover"
                            style="width: 80px; height: 40px; border-radius: 4px"
                            :preview-src-list="[scope.row.image]" />
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="100" />
                <el-table-column prop="productId" label="商品ID" width="120" />
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="openEdit(scope.row)">
                            <el-icon>
                                <Edit />
                            </el-icon> 编辑
                        </el-button>
                        <el-button size="small" type="danger" @click="delBanner(scope.row)">
                            <el-icon>
                                <Delete />
                            </el-icon> 删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper" @size-change="fetchBanners"
                @current-change="fetchBanners" style="margin-top: 20px; text-align: right" />
        </el-card>

        <!-- 新增/编辑弹窗 -->
        <el-dialog v-model="showDialog" :title="isAdd ? '新增轮播图' : '编辑轮播图'" width="500" top="6vh">
            <el-form :model="form" label-width="80px">
                <el-form-item label="标题" required>
                    <el-input v-model="form.title" placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="图片" required>
                    <!-- 关闭自动上传；只做本地选择 -->
                    <el-upload ref="uploadRef" action="#" list-type="picture-card" :auto-upload="false"
                        :show-file-list="false" :on-change="handleChange" accept="image/jpeg,image/png,image/webp">
                        <img v-if="localPreview" :src="localPreview" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商品ID" required>
                    <!-- 远程搜索下拉 -->
                    <el-select v-model="form.productId" filterable remote reserve-keyword placeholder="请输入商品名称搜索"
                        :remote-method="searchProduct" :loading="productLoading" clearable style="width: 100%">
                        <el-option v-for="p in productOptions" :key="p.id" :label="`${p.name} (ID:${p.id})`"
                            :value="p.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number v-model="form.sort" :min="0" :max="999" />
                </el-form-item>
                <!-- <el-form-item label="跳转链接">
                    <el-input v-model="form.link" placeholder="http/https" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item> -->
            </el-form>

            <template #footer>
                <el-button @click="showDialog = false">取消</el-button>
                <el-button type="primary" @click="submit">保存</el-button>
            </template>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Switch, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'

/* 搜索 & 分页 */
const searchForm = reactive({ title: '', status: '' })
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const loading = ref(false)
const bannerList = ref([])

/* 弹窗 & 表单 */
const showDialog = ref(false)
const isAdd = ref(true)
const form = reactive({
    id: null,
    title: '',
    image: '',
    sort: 0,
    productId: null
})
const getImage = row => {
    if (!row.image) return ''
    return row.image.startsWith('data:') ? row.image : `data:image/png;base64,${row.image}`
}

/* 列表数据 */
const fetchBanners = async () => {
    loading.value = true
    try {
        const res = await request.get('/api/carousel/listAll', {
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            param: {
                title: searchForm.title || null,
                // status: searchForm.status === '' ? null : searchForm.status
            }
        })
        bannerList.value = (res.data || []).map(item => ({
            ...item,
            image: getImage(item),
        }))
        console.log(bannerList.value)
        pagination.total = res.total || 0
    } catch (e) {
        ElMessage.error('获取列表失败')
    } finally {
        loading.value = false
    }
}

/* 重置 */
const resetSearch = () => {
    searchForm.title = ''
    searchForm.status = ''
    pagination.pageNum = 1
    fetchBanners()
}


const delBanner = row => {
    ElMessageBox.confirm('确定删除该轮播图？', '提示', { type: 'warning' })
        .then(async () => {
            await request.delete(`/api/carousel/delete/${row.id}`)
            ElMessage.success('删除成功')
            fetchBanners()
        })
        .catch(() => { })
}

/* 上传 */
const beforeUpload = raw => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(raw.type)) {
        ElMessage.error('仅支持 jpg/png/webp')
        return false
    }
    if (raw.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小不能超过 2MB')
        return false
    }
    return true
}

/* ===== 远程搜索商品 ===== */
const productLoading = ref(false)
const productOptions = ref([])          // 下拉数据源

/* 远程搜索函数：防抖 300 ms */
let searchTimer = null
const searchProduct = (query) => {
    if (!query || query.trim().length < 1) return
    clearTimeout(searchTimer)
    searchTimer = setTimeout(async () => {
        productLoading.value = true
        try {
            /* 用你的商品模糊搜索接口 */
            const res = await request.post('/api/product/admin/listAll', {
                pageNum: 1,
                pageSize: 20,
                param: { productName: query.trim() }
            })
            productOptions.value = res.data || []
        } catch {
            ElMessage.error('商品搜索失败')
        } finally {
            productLoading.value = false
        }
    }, 300)
}


const uploadRef = ref(null)   // el-upload 实例
const localPreview = ref('')     // 本地预览地址
let selectFile = null        // 真正待上传的 File

/* 选中文件 -> 本地预览 */
const handleChange = ({ raw }) => {
    if (!raw) return
    const allow = ['image/jpeg', 'image/png', 'image/webp']
    if (!allow.includes(raw.type)) return ElMessage.error('仅支持 jpg/png/webp')
    if (raw.size / 1024 / 1024 > 2) return ElMessage.error('图片大小不能超过 2MB')
    selectFile = raw
    localPreview.value = URL.createObjectURL(raw)
}

/* 一次性 FormData 提交（含图片） */
const submit = async () => {
    if (!form.title) return ElMessage.warning('请输入标题')
    if (!selectFile && !form.image) return ElMessage.warning('请选择图片')
    if (!form.productId) return ElMessage.warning('请选择商品')

    const fd = new FormData()
    if (form.id) fd.append('id', form.id)
    fd.append('title', form.title)
    fd.append('sort', form.sort ?? 0)
    fd.append('productId', form.productId)
    /* 如果本次选了新图，就用新图；编辑时没选图则保持原图（后端允许不传就沿用旧图） */
    if (selectFile) fd.append('image', selectFile)

    try {
        const url = isAdd.value ? '/api/carousel/add' : '/api/carousel/update'
        await request.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        ElMessage.success(isAdd.value ? '新增成功' : '编辑成功')
        showDialog.value = false
        fetchBanners()
    } catch {
        ElMessage.error('保存失败')
    }
}

const openAdd = () => {
    isAdd.value = true
    Object.assign(form, { id: null, title: '', image: '', sort: 0, productId: null })
    selectFile = null
    localPreview.value = ''
    showDialog.value = true
}

const openEdit = row => {
    isAdd.value = false
    Object.assign(form, row)
    // selectFile = null
    localPreview.value = row.image   // 回显旧图
    showDialog.value = true
}
/* 勾选项 */
const handleSelectionChange = val => {
    console.log(val)
}

onMounted(fetchBanners)
</script>

<style scoped>
/* 完全沿用 product-audit 的样式变量与命名 */
.banner-manage {
    width: 100%;
}

.search-card {
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.table-card {
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
    margin-top: 20px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--orange-dark);
}

.el-button {
    border-radius: 8px;
}

.avatar-uploader {
    width: 120px;
    height: 80px;
    border: 1px dashed #ccc;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
}

.avatar-uploader-icon {
    font-size: 24px;
    color: #999;
}
</style>