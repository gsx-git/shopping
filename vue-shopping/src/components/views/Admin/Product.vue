<template>
    <div class="product-audit">
        <!-- 搜索筛选栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchProducts">
                <el-form-item label="商品名称">
                    <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="店铺名称">
                    <el-input v-model="searchForm.shopName" placeholder="请输入店铺名称" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="审核状态">
                    <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable style="width: 100px">
                        <el-option label="待审核" value=0 />
                        <el-option label="下架" value=1 />
                        <el-option label="上架" value=2 />
                        <el-option label="已驳回" value=3 />
                    </el-select>
                </el-form-item>
                <el-form-item label="商品分类">
                    <el-cascader v-model="categoryCascaderValue" :options="categoryTree" :props="cascaderProps"
                        clearable placeholder="全部" style="width: 160px" @change="onCategoryChange" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchProducts"> <el-icon>
                            <Search />
                        </el-icon> 搜索
                    </el-button>
                    <el-button @click="resetSearch"> <el-icon>
                            <Refresh />
                        </el-icon> 重置 </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 商品列表 -->
        <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
                <div class="table-header">
                    <span>商品审核列表</span>
                </div>
            </template>

            <el-table :data="productList" stripe v-loading="loading" style="width: 100%;"
                @selection-change="handleSelectionChange" ref="productTableRef">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="商品ID" width="80" />
                <el-table-column prop="name" label="商品名称" min-width="150" />
                <el-table-column prop="shopName" label="所属店铺" min-width="120" />
                <!-- <el-table-column label="商品分类" width="100">
                    <template #default="scope">
                        <el-tag type="info">{{ fmtCategoryName(scope.row.categoryId) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="商品价格" width="100">
                    <template #default="scope">
                        ¥{{ scope.row.price }}
                    </template>
                </el-table-column>
                <el-table-column label="商品规格" width="140">
                    <template #default="scope">
                        <span>{{ getMainSpec(scope.row.skus) }}</span>
                    </template>
                </el-table-column> -->
                <el-table-column label="提交时间" min-width="100">
                    <template #default="scope">
                        {{ formatTime(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column prop="auditStatus" label="商品状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 0 ? 'warning' :
                            scope.row.status === 3 ? 'danger' : scope.row.status === 2 ? 'success' : 'info'
                            ">
                            {{
                                scope.row.status === 0 ? '待审核' :
                                    scope.row.status === 3 ? '已驳回' : scope.row.status === 2 ? '已上架' : '下架'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="viewProduct(scope.row)">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看
                        </el-button>
                        <el-button size="small" type="success"
                            @click="auditProduct(scope.row, 1), console.log('auditProduct', row);"
                            v-if="scope.row.status === 0">
                            <el-icon>
                                <Check />
                            </el-icon>
                            通过
                        </el-button>
                        <el-button size="small" type="danger" @click="auditProduct(scope.row, 3)"
                            v-if="scope.row.status === 0">
                            <el-icon>
                                <Close />
                            </el-icon>
                            驳回
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper" @size-change="fetchProducts"
                @current-change="fetchProducts" style="margin-top: 20px; text-align: right;" />
        </el-card>

        <!-- 商品详情弹窗 -->
        <el-dialog v-model="showProductDetailDialog" title="商品详情" width="600" top="6vh">
            <el-row :gutter="16">
                <!-- 左侧图片 -->
                <el-col :span="10">
                    <el-image :src="imgSrc" fit="cover" style="width: 100%; height: 200px; border-radius: 4px"
                        :preview-src-list="[imgSrc]" />
                </el-col>

                <!-- 右侧信息 -->
                <el-col :span="14">
                    <div style="margin-bottom: 8px; font-size: 16px; font-weight: bold">
                        {{ currentProduct.name }}
                    </div>
                    <div style="font-size: 14px; color: #666; line-height: 24px">
                        <div>所属店铺：{{ currentProduct.shopName }}</div>
                        <div>商品分类：{{ fmtCategoryName(currentProduct.categoryId) }}</div>
                        <div>
                            商品价格：
                            <span style="color: #f56c6c; font-size: 18px">¥{{ currentProduct.price }}</span>
                        </div>
                        <div>提交时间：{{ formatTime(currentProduct.createTime) }}</div>
                        <!-- 新增 SKU 展示 -->
                        <div style="margin-top:8px">商品规格：</div>
                        <div style="padding-left:12px;font-size:13px;color:#555">
                            <div v-for="(s, i) in currentProduct.skus" :key="s.id" style="line-height:22px">
                                {{ i + 1 }}.
                                <span class="sku-spec">{{ fmtSpecs(s.specs) }}</span>
                                <span class="sku-price">¥{{ s.price.toFixed(2) }}</span>
                                <span class="sku-stock">库存{{ s.stock }}</span>
                            </div>
                        </div>
                        <div style="margin-top: 8px">
                            状态：
                            <el-tag :type="currentProduct.status === 0 ? 'warning' : currentProduct.status === 3
                                ? 'danger' : currentProduct.status === 2 ? 'success' : 'info'">
                                {{ currentProduct.status === 0 ? '待审核' : currentProduct.status === 3
                                    ? '已驳回' : currentProduct.status === 2 ? '已上架' : '下架' }}
                            </el-tag>
                        </div>
                    </div>

                    <!-- 底部按钮 -->
                    <div style="margin-top: 16px; text-align: right">
                        <el-button v-if="currentProduct.status === 0" type="success"
                            @click="auditProduct(currentProduct, 1)">
                            通过
                        </el-button>
                        <el-button v-if="currentProduct.status === 0" type="danger"
                            @click="auditProduct(currentProduct, 3)">
                            驳回
                        </el-button>
                        <el-button @click="showProductDetailDialog = false">关闭</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Check, Close, Clock, Calendar } from '@element-plus/icons-vue'
import request from '@/utils/request'
import axios from 'axios'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
    productName: '',
    shopName: '',
    auditStatus: '',
    categoryId: null,
    dateRange: []
})

// 分页参数
const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

// 商品列表
const productList = ref([])

// 统计数据
const statData = reactive({
    pendingCount: 28,
    todayPassedCount: 45,
    todayPassedRate: 12.5,
    todayRejectedCount: 8,
    todayRejectedRate: 5.2,
    monthTotalCount: 896,
    monthCompletionRate: 85.7
})

// 弹窗状态
const showProductDetailDialog = ref(false)
const showBatchAuditDialog = ref(false)

// 当前选中商品
const currentProduct = ref({})
const selectedProducts = ref([])

// 审核表单
const auditForm = reactive({
    result: '',
    opinion: ''
})

// 批量审核表单
const batchAuditForm = reactive({
    result: '',
    opinion: ''
})

// 表格引用
const productTableRef = ref(null)

// 获取商品列表
const fetchProducts = async () => {
    loading.value = true
    try {
        console.log('searchForm.auditStatus', searchForm.auditStatus)
        const res = await request.post('/api/product/admin/listAll', {
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            param: {
                productName: searchForm.productName || null,
                shopName: searchForm.shopName || null,
                categoryId: searchForm.categoryId || null,
                status: searchForm.auditStatus === '' ? null : searchForm.auditStatus,
            }
        })
        productList.value = res.data || []
        pagination.total = res.total || 0
    } catch (error) {
        ElMessage.error('获取商品列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

/* 取第一款 SKU 的规格文本用于列表 */
function getMainSpec(skus = []) {
    if (!skus.length) return '-'
    try {
        const specObj = JSON.parse(skus[0].specs || '{}')
        return Object.values(specObj).join(' · ')
    } catch {
        return skus[0].specs || '-'
    }
}

/* JSON -> 扁平字符串  */
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
/* 格式化时间数组为字符串 */
function formatTime(arr) {
    if (!Array.isArray(arr) || arr.length < 6) return '-'
    const [y, M, d, h, m, s] = arr
    return `${y}-${String(M).padStart(2, '0')}-${String(d).padStart(2, '0')} 
    ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 重置搜索
const resetSearch = () => {
    searchForm.productName = ''
    searchForm.shopName = ''
    searchForm.auditStatus = ''
    searchForm.categoryId = null   // 级联选择器会自动清空
    searchForm.dateRange = []
    pagination.pageNum = 1
    fetchProducts()
}

// 查看商品详情
const viewProduct = (product) => {
    currentProduct.value = { ...product }
    showProductDetailDialog.value = true
}

const imgSrc = computed(() => {
    const src = currentProduct.value.productImg
    if (!src) return ''                        // 没有图时直接空，避免 data:undefined
    return src.startsWith('data:') ? src : `data:image/png;base64,${src}`
})
// 审核商品
const auditProduct = (product, result) => {
    currentProduct.value = { ...product }
    auditForm.result = result
    auditForm.opinion = ''
    confirmAudit()
}

// 确认审核
const confirmAudit = async () => {
    try {
        await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/product/update`,
            { id: currentProduct.value.id, status: auditForm.result }
        );
        ElMessage.success(`商品${auditForm.result === 1 ? '审核通过' : '审核驳回'}`);
        showProductDetailDialog.value = false;
    } catch (e) {
        ElMessage.error('审核操作失败');
        console.error(e);        // 方便调试
        return;                  // 失败就终止，不再刷新
    }
    await fetchProducts();     // 就是你原来的 loadData()
};

/* ---------- 1. 级联所需数据 ---------- */
const categoryTree = ref([])          // 两级树
const cascaderProps = { value: 'id', label: 'name', children: 'children' }

/* ---------- 2. 回显用 computed ---------- */
const categoryCascaderValue = computed({
    get() {
        if (!searchForm.categoryId) return []
        // 在树里找到 categoryId 对应的 [parentId, categoryId]
        for (const p of categoryTree.value) {
            if (p.children?.some(c => c.id === searchForm.categoryId)) {
                return [p.id, searchForm.categoryId]
            }
        }
        return []
    },
    set() { /* 已在 @change 处理 */ }
})

/* ---------- 3. 选中后的处理 ---------- */
function onCategoryChange(val) {
    // val 为 [parentId, childId] 或 null
    searchForm.categoryId = val?.[1] ?? null
}

/* ---------- 4. 初始化时拉取分类树 ---------- */
onMounted(async () => {
    await buildCategoryTree()   // 先构建树
    fetchProducts()             // 再拉列表
})

async function buildCategoryTree() {
    const { data } = await request.get('/api/productCategory/listALL')
    const map = {}
    const tree = []
    data.forEach(n => { map[n.id] = { ...n, children: [] } })
    data.forEach(n => {
        if (n.parentId == null) {
            tree.push(map[n.id])
        } else {
            map[n.parentId]?.children.push(map[n.id])
        }
    })
    categoryTree.value = tree
}

function fmtCategoryName(id) {
    if (!id) return ''
    for (const p of categoryTree.value) {
        const hit = p.children.find(c => c.id === id)
        if (hit) return hit.name
    }
    return ''
}

// 监听选择事件
const handleSelectionChange = (val) => {
    selectedProducts.value = val
}

// 初始化
onMounted(() => {
    fetchProducts()
})
</script>

<style scoped>
.product-audit {
    width: 100%;
}

.search-card {
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.stat-card {
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.stat-content {
    text-align: center;
    padding: 10px 0;
}

.stat-label {
    color: #999;
    font-size: 14px;
    margin: 0 0 8px 0;
}

.stat-value {
    color: var(--orange-dark);
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
}

.stat-change {
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.text-green {
    color: #67c23a;
}

.text-red {
    color: #f56c6c;
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

.el-table {
    --el-table-header-text-color: var(--orange-dark);
    --el-table-row-hover-bg-color: rgba(255, 120, 0, 0.05);
    --el-table-current-row-bg-color: rgba(255, 120, 0, 0.1);
}

.product-detail {
    padding: 10px 0;
}

.product-desc {
    padding: 10px;
    line-height: 1.6;
    color: #666;
}

.audit-actions {
    margin-top: 20px;
}

.el-button {
    border-radius: 8px;
}

.el-button--primary {
    /* background: var(--orange-gradient-deep); */
    border: none;
}

.el-button--primary:hover {
    /* background: var(--orange-gradient); */
    border: none;
}

.el-button--success {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    border: none;
}

.el-button--danger {
    background: linear-gradient(135deg, #f44336 0%, #ff5722 100%);
    border: none;
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
</style>