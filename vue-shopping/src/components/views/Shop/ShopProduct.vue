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
                        <el-button type="text" @click="goBack" class="back-button">返回
                            <i class="el-icon-arrow-left"></i></el-button>
                    </div>
                </div>
            </template>

            <!-- 商品列表 -->
            <el-table :data="productList" row-key="id" v-loading="loading" show-overflow-tooltip>
                <el-table-column label="商品图" width="100">
                    <template #default="{ row }">
                        <el-image style="width:60px;height:60px;border-radius:4px;cursor:pointer" :src="row.productImg"
                            :preview-src-list="[row.productImg]" fit="cover" :preview-teleported="true" :z-index="9999">
                            <template #error>
                                <img src="https://picsum.photos/60/60?random=888" class="goods-img" />
                            </template>
                        </el-image>
                    </template>
                </el-table-column>

                <el-table-column label="商品名称" width="200">
                    <template #default="{ row }">
                        <span style="color:#409eff;cursor:pointer" @click="goProductDetail(row.id)">{{ row.name
                        }}</span>
                    </template>
                </el-table-column>

                <!-- 新增：规格列 -->
                <el-table-column label="规格" min-width="160">
                    <template #default="{ row }">
                        <div class="sku-wrap">
                            <div v-for="s in row.skus" :key="s.id" class="sku-line">
                                <!-- 解析 + 美化 -->
                                <span class="sku-spec">{{ fmtSpecs(s.specs) }}</span>
                                <span class="sku-price">¥{{ s.price.toFixed(2) }}</span>
                                <span class="sku-stock">库存{{ s.stock }}</span>
                            </div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'info' :
                            row.status === 2 ? 'success' : 'danger'">
                            {{ { 0: '未审核', 1: '未上架', 2: '已上架', 3: '已驳回' }[row.status] || '未知' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>
                        <el-button size="small" @click="toggleStatus(row)">
                            {{ { 0: '上架', 1: '上架', 2: '下架' ,3:'上架'}[row.status] }}
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
            <el-pagination background layout="prev, pager, next, jumper,->,total" :total="total" :page-size="pageSize"
                :current-page="pageNum" @current-change="handlePageChange" style="margin-top:16px" />
        </el-card>

        <!-- 新增/编辑弹窗 -->
        <el-dialog :title="form.id ? '修改商品' : '新增商品'" v-model="showDialog" width="680px" @closed="resetForm">
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

                <!-- 只读 -->
                <!-- <el-form-item label="库存">
                    <el-input :model-value="form.stock" readonly disabled style="width:120px" />
                </el-form-item>
                <el-form-item label="销量">
                    <el-input :model-value="form.sales" readonly disabled style="width:120px" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-input :model-value="{ 0: '未审核', 1: '下架', 2: '上架' }[form.status]" readonly disabled
                        style="width:120px" />
                </el-form-item> -->

                <el-row :gutter="0">
                    <el-col :span="6">
                        <el-form-item label="库存">
                            <el-input :model-value="form.stock" readonly disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="销量">
                            <el-input :model-value="form.sales" readonly disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="状态">
                            <el-input :model-value="{ 0: '未审核', 1: '下架', 2: '上架' }[form.status]" readonly disabled />
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- SKU 表格 -->
                <el-form-item label="商品规格">
                    <el-table :data="skuList" size="small" max-height="150">
                        <el-table-column prop="specs" label="规格描述">
                            <template #default="{ row }">
                                <el-input v-model="row.specs" placeholder="如：颜色:红，尺码:L" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="price" label="单价" width="100">
                            <template #default="{ row }">
                                <el-input-number v-model="row.price" :precision="2" :min="0.01"
                                    controls-position="right" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="stock" label="库存" width="100">
                            <template #default="{ row }">
                                <el-input-number v-model="row.stock" :min="0" controls-position="right" />
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="{ $index }">
                                <el-button type="text" style="color:#f56c6c"
                                    @click="skuList.splice($index, 1)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-button type="text" icon="Plus"
                        @click="skuList.push({ specs: '', price: form.price, stock: 0 })">添加规格</el-button>
                </el-form-item>

                <el-form-item label="分类">
                    <el-cascader v-model="cascaderValue" :options="cascaderList" :props="cascaderProps" clearable
                        placeholder="请选择分类" @change="([parentId, childId]) => form.categoryId = childId" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="showDialog = false">取消</el-button>
                <el-button type="primary" @click="submit">保存</el-button>
            </template>
        </el-dialog>

        <!-- 库存调整弹窗（保持你之前逻辑，仅样式微调） -->
        <el-dialog title="库存调整" v-model="showStockDialog" width="360px">
            <div>当前库存：<strong>{{ curRow.stock }}</strong></div>
            <el-input-number v-model="adjustNum" :min="1" :max="adjustType === -1 ? curRow.stock : curRow.stock + 9999"
                :step="1" style="width:100%;margin-top:10px" />
            <template #footer>
                <el-button @click="showStockDialog = false">取消</el-button>
                <el-button type="primary" @click="doAdjust">确定</el-button>
            </template>
        </el-dialog>
    </el-main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()

/* -------- 基础数据 -------- */
const loading = ref(false)
const productList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const shopId = ref(null)
const keyword = ref('')

/* SKU 相关 */
const skuList = ref([])   // 弹窗内规格列表

/* 获取当前用户店铺ID */
const getShopId = async () => {
    const raw = localStorage.getItem('system-user')
    if (!raw) return
    const user = JSON.parse(raw)
    const res = await request.get(`/api/shop/list/${user.id}`)
    if (res.code === 200 && res.data?.length) shopId.value = res.data[0].id
}

/* 加载商品（含SKU） */
const loadData = async () => {
    if (!shopId.value) return
    loading.value = true
    try {
        const res = await request.post(`/api/product/listByShop/${shopId.value}`, {
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            name: keyword.value || undefined
        })
        productList.value = (res.content || []).map(item => ({
            ...item,
            productImg: item.productImg
                ? `data:image/png;base64,${item.productImg}`
                : `https://picsum.photos/60/60?random=${item.id}`,
            skus: item.skus || []
        }))
        total.value = res.totalElements || 0
        pageNum.value = Number(res.number ?? 0) + 1
    } catch (e) {
        ElMessage.error('加载商品失败：' + e.message)
    } finally {
        loading.value = false
    }
}
const handlePageChange = val => { pageNum.value = val; loadData() }

/* 上下架 */
const toggleStatus = async (row) => {
    if (row.status === 0) { ElMessage.warning('商品未审核，无法上下架'); return }
    if (row.status === 3) { ElMessage.error('商品已驳回，无法上下架'); return }
    const next = row.status === 2 ? 1 : 2
    try {
        await request.post('/api/product/update', { id: row.id, status: next })
        ElMessage.success(next === 2 ? '已上架' : '已下架')
        row.status = next
    } catch { ElMessage.error('操作失败') }
}

/* -------- 弹窗表单相关 -------- */
const showDialog = ref(false)
const form = reactive({
    id: null, name: '', subtitle: '', price: 0, stock: 0, sales: 0, categoryId: null, status: 0
})
const uploadRef = ref()
const imageFile = ref(null)
const imageUrl = ref(null)

function openAdd() {
    resetForm()
    skuList.value = []
    showDialog.value = true
}
async function openEdit(row) {
    Object.assign(form, row)
    form.categoryId = row.categoryId || 12
    imageUrl.value = row.productImg || null
    /* 取详情把SKU拉全 *//* 关键：把 SKU 里的 specs 先格式化成扁平字符串再给用户改 */
    skuList.value = (row.skus || []).map(s => ({
        ...s,
        specs: fmtSpecs(s.specs)   // <-- 新增
    }))
    showDialog.value = true
}
function resetForm() {
    Object.assign(form, { id: null, name: '', subtitle: '', price: 0, stock: 0, sales: 0, categoryId: null, status: 0 })
    imageFile.value = null; imageUrl.value = null; skuList.value = []
    uploadRef.value?.clearFiles()
}
function onFileChange(uploadFile) {
    imageFile.value = uploadFile.raw
    imageUrl.value = URL.createObjectURL(imageFile.value)
}

/* 提交（商品+SKU） */
async function submit() {
    if (!form.name) return ElMessage.warning('请填写商品名称')
    if (!form.categoryId) return ElMessage.warning('请选择商品分类')
    try {
        let productId = form.id
        /* 保存SKU 之前：把主商品价格 = 所有 SKU 最低价 */
        const minPrice = Math.min(...skuList.value.map(s => Number(s.price)).filter(p => !isNaN(p)))
        if (isNaN(minPrice)) return ElMessage.warning('SKU 价格填写错误')
        form.price = minPrice
        /* 1. 保存主商品 */
        if (form.id) {
            await request.post('/api/product/update', {
                id: form.id, name: form.name, subtitle: form.subtitle,
                price: form.price, categoryId: form.categoryId, status: 0
            })
        } else {
            if (!imageFile.value) return ElMessage.warning('请选择商品图片')
            const dto = {
                name: form.name, subtitle: form.subtitle, price: form.price,
                categoryId: form.categoryId, status: form.status, shopId: shopId.value
            }
            const fd = new FormData()
            fd.append('productDTO', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
            fd.append('file', imageFile.value)
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/product/add`, fd,
                { headers: { 'Content-Type': undefined } })
            productId = res.data.data
        }
        /* 保存SKU */
        for (const s of skuList.value) {
            if (!s.specs) continue

            // 保证 skuCode 非空
            if (!s.skuCode?.trim()) {
                // 用规格文本生成 code：去掉中文符号+空格 → 小写下划线拼接
                s.skuCode = s.specs
                    .replace(/，/g, ',')
                    .replace(/：/g, ':')
                    .replace(/\s+/g, '_')
                    .toLowerCase()
            }
            const skuDTO = {
                ...s,
                specs: parseSpecs(s.specs),
                skuCode: s.skuCode.trim(),
                product: { id: productId }
            }
            if (s.id) await request.put('/api/productSku/update', skuDTO)
            else await request.post('/api/productSku/add', skuDTO)
        }
        ElMessage.success(form.id ? '修改成功' : '新增成功')
        showDialog.value = false; loadData()
    } catch (e) {
        ElMessage.error('保存失败：' + e.message)
    }
}

/* 删除 */
const doDel = async (id) => {
    try {
        await request.delete(`/api/product/delete/${id}`)
        ElMessage.success('删除成功')
        const remain = total.value % pageSize.value
        if (remain === 1 && pageNum.value > 1) pageNum.value--
        loadData()
    } catch { ElMessage.error('删除失败') }
}

/* 库存调整（保持你原有逻辑） */
const showStockDialog = ref(false)
const curRow = reactive({ id: null, stock: 0 })
const adjustNum = ref(1)
const adjustType = ref(1)
function openStock(row, type) {
    Object.assign(curRow, row)
    adjustType.value = type; adjustNum.value = 1; showStockDialog.value = true
}
async function doAdjust() {
    const delta = adjustType.value * adjustNum.value
    const newStock = curRow.stock + delta
    if (newStock < 0) { ElMessage.error('库存不能小于0'); return }
    try {
        await request.post('/api/product/update', { id: curRow.id, stock: newStock })
        ElMessage.success(delta > 0 ? '入库成功' : '出库成功')
        showStockDialog.value = false; loadData()
    } catch { ElMessage.error('调整失败') }
}

/* 1. 展示：JSON -> 扁平字符串  */
const fmtSpecs = (specCell = '') => {
    if (!specCell.trim()) return ''
    try {
        // 正常情况：后端存的是 JSON 字符串
        const obj = JSON.parse(specCell)
        return Object.entries(obj)
            .map(([k, v]) => `${k}:${v}`)   // 无空格
            .join(',')                      // 逗号分隔
    } catch {
        // 容错：本身已是“红|128G”这类老数据
        return specCell.includes('|') ? specCell.split('|').join(',') : specCell
    }
}

/* 2. 录入/修改：扁平字符串 -> JSON（加强容错） */
const parseSpecs = (flatStr = '') => {
    if (!flatStr || typeof flatStr !== 'string') return ''

    // 1. 归一化中英文符号
    const str = flatStr
        .replace(/，/g, ',')   // 中文逗号
        .replace(/：/g, ':')   // 中文冒号
        .replace(/｜/g, '|')   // 全角竖线 → 半角竖线
        .trim()

    if (!str) return ''

    // 2. 完全没有冒号，当成老格式“红色|128G”直接返回
    if (!str.includes(':')) return str

    // 3. 按英文逗号拆分键值对
    const json = {}
    str.split(',').forEach(pair => {
        const [k, ...vParts] = pair.split(':')
        if (!k) return
        const key = k.trim()
        const val = vParts.join(':').trim() // 允许值里再带冒号
        if (key && val !== undefined) json[key] = val
    })

    // 4. 若一个有效键值都没解析出来，则原样返回（兼容老数据）
    return Object.keys(json).length ? JSON.stringify(json) : str
}

/* 新增：级联所需数据 */
const cascaderList = ref([])          // 两级树
const cascaderProps = { value: 'id', label: 'name', children: 'children' }

onMounted(async () => {
    await getShopId()

    /* ===== 1. 拉全部分类并拼成两级树 ===== */
    const { data } = await request.get('/api/productCategory/listALL')
    const map = {}                        // id → node
    const tree = []
    data.forEach(n => { map[n.id] = { ...n, children: [] } })
    data.forEach(n => {
        if (n.parentId == null) {           // 根节点
            tree.push(map[n.id])
        } else {                            // 子节点
            map[n.parentId]?.children.push(map[n.id])
        }
    })
    cascaderList.value = tree

    if (shopId.value) loadData()
    else ElMessage.warning('您还未开设店铺')
})

/* 回显用：把 categoryId -> [parentId, categoryId] */
const cascaderValue = computed({
    get() {
        if (!form.categoryId) return []
        for (const p of cascaderList.value) {
            if (p.children.some(c => c.id === form.categoryId)) return [p.id, form.categoryId]
        }
        return []
    },
    set() { /* 已在 @change 处理 */ }
})

/* 返回 / 跳转 */
const goBack = () => router.back()
const goProductDetail = id => router.push(`/product/${id}`)

onMounted(async () => {
    await getShopId()
    if (shopId.value) loadData()
    else ElMessage.warning('您还未开设店铺')
})
</script>

<style scoped>
.shop-product-main {
    background-color: #f5f5f5;
    padding: 20px
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: center
}

.back-button {
    color: #ff5000;
    font-size: 14px
}

.goods-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px
}

.sku-wrap {
    line-height: 1.6;
}

.sku-line {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
}

.sku-spec {
    color: #303133;
    font-weight: 500;
}

.sku-price {
    color: #ff5000;
    margin-left: 8px;
}

.sku-stock {
    color: #909399;
    margin-left: 8px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover
}
</style>