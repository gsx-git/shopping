<template>
    <el-main class="shop-product-main">
        <el-card class="product-card">
            <template #header>
                <div class="product-header">
                    <div>
                        <span>店铺商品
                            <span style="font-size: 12px; color: #ff5000">（点击商品名称查看商品详情）</span>
                        </span>
                        <el-button type="primary" size="small" @click="openAdd">新增商品</el-button>
                    </div>

                    <div>
                        <el-button type="text" @click="goBack" class="back-button">
                            返回 <i class="el-icon-arrow-left"></i>
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="productList" row-key="id" v-loading="loading" show-overflow-tooltip>
                <!-- 商品图 -->
                <el-table-column label="商品图" width="100">
                    <template #default="{ row }">
                        <el-image style="
                width: 60px;
                height: 60px;
                border-radius: 4px;
                cursor: pointer;
              " :src="row.productImg" :preview-src-list="[row.productImg]" fit="cover">
                            <template #error>
                                <img src="https://picsum.photos/60/60?random=888" class="goods-img" />
                            </template>
                        </el-image>
                    </template>
                </el-table-column>

                <!-- 商品名称 -->
                <el-table-column label="商品名称" min-width="200">
                    <template #default="{ row }">
                        <span style="color: #409eff; cursor: pointer" @click="goProductDetail(row.id)">
                            {{ row.name }}
                        </span>
                    </template>
                </el-table-column>

                <!-- 售价 -->
                <el-table-column label="售价" width="100">
                    <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
                </el-table-column>

                <!-- 库存 -->
                <el-table-column label="库存" width="90">
                    <template #default="{ row }">{{ row.stock }}</template>
                </el-table-column>

                <!-- 库存操作 -->
                <el-table-column label="库存调整" width="160">
                    <template #default="{ row }">
                        <el-button size="small" @click="openStock(row, 1)">入库</el-button>
                        <el-button size="small" @click="openStock(row, -1)">出库</el-button>
                    </template>
                </el-table-column>

                <!-- 销量 -->
                <el-table-column label="销量" width="90">
                    <template #default="{ row }">{{ row.sales }}</template>
                </el-table-column>

                <!-- 状态 -->
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 2 ? 'success' : row.status === 1 ? 'warning' : 'info'
                            ">
                            {{ { 0: '未审核', 1: '下架', 2: '上架' }[row.status] || '未知' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 操作 -->
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>

                        <el-button size="small" @click="toggleStatus(row)">
                            {{ { 0: '上架', 1: '上架', 2: '下架' }[row.status] }}
                        </el-button>

                        <el-popconfirm title="确定删除该商品吗？" @confirm="doDel(row.id)">
                            <template #reference>
                                <el-button size="small" type="danger">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination background layout="prev, pager, next, jumper, ->, total" :total="total" :page-size="pageSize"
                :current-page="pageNum" @current-change="handlePageChange" style="margin-top: 16px" />
        </el-card>

        <!-- 新增/修改弹窗 -->
        <el-dialog :title="form.id ? '修改商品' : '新增商品'" v-model="showDialog" width="520px" @closed="resetForm">
            <el-form :model="form" label-width="90px">
                <el-form-item label="商品图片">
                    <el-upload ref="uploadRef" action="#" :limit="1" :auto-upload="false" :on-change="onFileChange"
                        :show-file-list="false" accept="image/*">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>

                <el-form-item label="名称">
                    <el-input v-model="form.name" placeholder="请输入商品名称" />
                </el-form-item>
                <el-form-item label="副标题">
                    <el-input v-model="form.subtitle" placeholder="请输入副标题" />
                </el-form-item>
                <el-form-item label="售价">
                    <el-input-number v-model="form.price" :precision="2" :min="0.01" />
                </el-form-item>

                <!-- 只读字段 -->
                <el-form-item label="库存">
                    <el-input :model-value="form.stock" readonly disabled style="width: 120px" />
                </el-form-item>
                <el-form-item label="销量">
                    <el-input :model-value="form.sales" readonly disabled style="width: 120px" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-input :model-value="{ 0: '未审核', 1: '下架', 2: '上架' }[form.status]" readonly disabled
                        style="width: 120px" />
                </el-form-item>

                <el-form-item label="分类">
                    <el-select v-model="form.categoryId" placeholder="请选择分类">
                        <el-option label="家用电器" :value="41" />
                        <el-option label="数码3C" :value="42" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="showDialog = false">取消</el-button>
                <el-button type="primary" @click="submit">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog title="库存调整" v-model="showStockDialog" width="360px">
            <div>当前库存：<strong>{{ curRow.stock }}</strong></div>
            <el-input-number v-model="adjustNum" :min="1" :max="adjustType === -1 ? curRow.stock : curRow.stock + 9999"
                :step="1" style="width: 100%; margin-top: 10px" />
            <template #footer>
                <el-button @click="showStockDialog = false">取消</el-button>
                <el-button type="primary" @click="doAdjust">确定</el-button>
            </template>
        </el-dialog>
    </el-main>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import request from '@/utils/request'
import { Plus } from '@element-plus/icons-vue'
import rawAxios from 'axios'

const router = useRouter()

/* 基础数据 */
const loading = ref(false)
const productList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const shopId = ref(null)
const keyword = ref('') // 搜索关键字

/* 获取当前用户店铺ID */
const getShopId = async () => {
    const raw = localStorage.getItem('system-user')
    if (!raw) return
    const user = JSON.parse(raw)
    const res = await request.get(`/api/shop/list/${user.id}`)
    if (res.code === 200 && res.data?.length) shopId.value = res.data[0].id
}

/* 加载商品分页数据 */
const loadData = async () => {
    if (!shopId.value) return
    loading.value = true
    try {
        const queryPageParam = {
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            name: keyword.value || undefined
        }
        const res = await request.post(
            `/api/product/listByShop/${shopId.value}`,
            queryPageParam
        )

        productList.value = (res.content || []).map((item) => ({
            id: item.id,
            name: item.name,
            subtitle: item.subtitle,
            price: item.price,
            stock: item.stock,
            sales: item.sales,
            status: item.status,
            productImg: item.productImg
                ? `data:image/png;base64,${item.productImg}`
                : `https://picsum.photos/60/60?random=${item.id}`
        }))
        total.value = res.totalElements || 0
        pageNum.value = Number(res.number ?? 0) + 1
    } catch (e) {
        console.error('加载商品异常', e)
        ElMessage.error('加载商品失败：' + (e.message || e))
    } finally {
        loading.value = false
    }
}

/* 分页切换 */
const handlePageChange = (val) => {
    pageNum.value = val
    loadData()
}

/* 上下架切换 */
const toggleStatus = async (row) => {
    if (row.status === 0) {
        ElMessage.warning('商品未审核，无法上下架')
        return
    }

    const next = row.status === 2 ? 1 : 2
    try {
        // 组装后端需要的完整 DTO（只改 status，其余用原值）
        const dto = {
            id: row.id,
            status: next,
            // 下面字段只用于占位，后端非空才覆盖
            name: null,
            subtitle: null,
            price: null,
            stock: null,
            sales: null,
            categoryId: null
        }
        // 走 /update 接口，用 PUT + Body
        await request.post('/api/product/update', dto)
        ElMessage.success(next === 2 ? '已上架' : '已下架')
        row.status = next
    } catch {
        ElMessage.error('操作失败')
    }
}

/* 库存调整相关 */
const showStockDialog = ref(false)
const curRow = reactive({ id: null, stock: 0 })
const adjustNum = ref(1)
const adjustType = ref(1) // 1 入库  -1 出库

function openStock(row, type) {
    Object.assign(curRow, row)
    adjustType.value = type
    adjustNum.value = 1
    showStockDialog.value = true
}

async function doAdjust() {
    const delta = adjustType.value * adjustNum.value
    const newStock = curRow.stock + delta
    if (newStock < 0) {
        ElMessage.error('调整后库存不能小于0')
        return
    }
    const dto = { id: curRow.id, stock: newStock }
    try {
        await request.post('/api/product/update', dto)
        ElMessage.success(delta > 0 ? '入库成功' : '出库成功')
        showStockDialog.value = false
        loadData()
    } catch {
        ElMessage.error('调整失败')
    }
}

const uploadRef = ref()
const imageFile = ref(null)
const imageUrl = ref(null)
const imageId = ref(null)

/* 弹窗表单 */
const showDialog = ref(false)
const form = reactive({
    id: null,
    name: '',
    subtitle: '',
    price: 0,
    stock: 0,
    sales: 0,
    categoryId: null,
    status: 0
})

/* 打开新增 */
function openAdd() {
    form.id = null
    showDialog.value = true
}

/* 打开编辑时回显图片 */
async function openEdit(row) {
    Object.assign(form, row)
    form.categoryId = row.categoryId || 41
    imageId.value = row.imageId || null
    imageUrl.value = row.productImg || null
    showDialog.value = true
}

/* 关闭弹窗清空文件 */
function resetForm() {
    Object.assign(form, {
        id: null,
        name: '',
        subtitle: '',
        price: 0,
        stock: 0,
        sales: 0,
        categoryId: null,
        status: 0
    })
    imageFile.value = null
    imageUrl.value = null
    imageId.value = null
    uploadRef.value?.clearFiles()
}

/* 文件选择事件 */
function onFileChange(uploadFile) {
    imageFile.value = uploadFile.raw
    imageUrl.value = URL.createObjectURL(imageFile.value)
}

/* ------------------  提交（新增 / 修改） ------------------ */
async function submit() {
    if (!form.name) return ElMessage.warning('请填写商品名称')

    try {
        if (form.id) {
            /* ---------- 修改商品 ---------- */
            await request.post('/api/product/update', {
                id: form.id,
                name: form.name,
                subtitle: form.subtitle,
                price: form.price,
                categoryId: form.categoryId,
                status: form.status
            })

            if (imageFile.value) {
                const imgFd = new FormData()
                console.log('imageFile:', imageFile)
                imgFd.append('file', imageFile.value)
                console.log('imgFd:', imgFd)
                await request.post(`/api/productImage/update/${form.id}`, imgFd)
            }
        } else {
            /* ---------- 新增商品 ---------- */
            if (!imageFile.value) return ElMessage.warning('请选择商品图片')

            const dtoObj = {
                name: form.name,
                subtitle: form.subtitle,
                price: form.price,
                categoryId: form.categoryId,
                status: form.status,
                shopId: shopId.value
            }
            console.log('dtoObj:', dtoObj)
            const fd = new FormData()
            fd.append(
                'productDTO',
                new Blob([JSON.stringify(dtoObj)], { type: 'application/json' })
            )
            fd.append('file', imageFile.value)
            console.log('fd:', fd)

            const res = await rawAxios.post(
                `${import.meta.env.VITE_BASE_URL}/api/product/add`,
                fd,
                { headers: { 'Content-Type': undefined } }
            )
            form.id = res.data
        }

        ElMessage.success(form.id ? '修改成功' : '新增成功')
        showDialog.value = false
        loadData()
    } catch (e) {
        ElMessage.error('保存失败：' + (e.message || e))
    }
}

/* 删除商品 */
const doDel = async (id) => {
    try {
        await request.delete(`/api/product/delete/${id}`)
        ElMessage.success('删除成功')
        // 删完最后一条自动回退一页
        const remain = total.value % pageSize.value
        if (remain === 1 && pageNum.value > 1) {
            pageNum.value--
        }
        loadData()
    } catch {
        ElMessage.error('删除失败')
    }
}

/* 跳转 */
const goBack = () => router.back() // 改为你的店铺首页路由
const goProductDetail = (id) => router.push(`/product/${id}`)
const goEdit = (id) => router.push(`/ushop/product/edit/${id}`)

onMounted(async () => {
    await getShopId()
    if (shopId.value) loadData()
    else ElMessage.warning('您还未开设店铺')
})
</script>

<style scoped>
.shop-product-main {
    background-color: #f5f5f5;
    padding: 20px;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

.goods-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}
</style>