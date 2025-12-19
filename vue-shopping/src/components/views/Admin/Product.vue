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
                    <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable>
                        <el-option label="待审核" value="pending" />
                        <el-option label="审核通过" value="passed" />
                        <el-option label="审核驳回" value="rejected" />
                    </el-select>
                </el-form-item>
                <el-form-item label="商品分类">
                    <el-select v-model="searchForm.category" placeholder="全部" clearable>
                        <el-option label="电子产品" value="electronics" />
                        <el-option label="服装鞋帽" value="clothing" />
                        <el-option label="食品生鲜" value="food" />
                        <el-option label="家居用品" value="home" />
                        <el-option label="美妆护肤" value="cosmetics" />
                    </el-select>
                </el-form-item>
                <el-form-item label="提交时间">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchProducts">
                        <el-icon>
                            <Search />
                        </el-icon>
                        搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 商品审核统计 -->
        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">待审核商品</p>
                        <p class="stat-value">{{ statData.pendingCount }}</p>
                        <p class="stat-change">
                            <el-icon>
                                <Clock />
                            </el-icon>
                            需及时处理
                        </p>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">今日审核通过</p>
                        <p class="stat-value">{{ statData.todayPassedCount }}</p>
                        <p class="stat-change text-green">
                            <el-icon>
                                <Check />
                            </el-icon>
                            +{{ statData.todayPassedRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">今日审核驳回</p>
                        <p class="stat-value">{{ statData.todayRejectedCount }}</p>
                        <p class="stat-change text-red">
                            <el-icon>
                                <Close />
                            </el-icon>
                            +{{ statData.todayRejectedRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">本月审核总数</p>
                        <p class="stat-value">{{ statData.monthTotalCount }}</p>
                        <p class="stat-change">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                            完成率 {{ statData.monthCompletionRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 商品列表 -->
        <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
                <div class="table-header">
                    <span>商品审核列表</span>
                    <div>
                        <el-button type="primary" size="small" @click="batchAudit('passed')">
                            <el-icon>
                                <Check />
                            </el-icon>
                            批量通过
                        </el-button>
                        <el-button type="danger" size="small" @click="batchAudit('rejected')" style="margin-left: 8px;">
                            <el-icon>
                                <Close />
                            </el-icon>
                            批量驳回
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="productList" border stripe v-loading="loading" style="width: 100%;"
                @selection-change="handleSelectionChange" ref="productTableRef">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="商品ID" width="80" />
                <el-table-column prop="productName" label="商品名称" min-width="200" />
                <el-table-column prop="shopName" label="所属店铺" width="120" />
                <el-table-column prop="category" label="商品分类" width="100">
                    <template #default="scope">
                        <el-tag type="info">
                            {{
                                scope.row.category === 'electronics' ? '电子产品' :
                                    scope.row.category === 'clothing' ? '服装鞋帽' :
                                        scope.row.category === 'food' ? '食品生鲜' :
                                            scope.row.category === 'home' ? '家居用品' : '美妆护肤'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="商品价格" width="100">
                    <template #default="scope">
                        ¥{{ scope.row.price }}
                    </template>
                </el-table-column>
                <el-table-column prop="submitTime" label="提交时间" min-width="180" />
                <el-table-column prop="auditStatus" label="审核状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.auditStatus === 'pending' ? 'warning' :
                                scope.row.auditStatus === 'passed' ? 'success' : 'danger'
                            ">
                            {{
                                scope.row.auditStatus === 'pending' ? '待审核' :
                                    scope.row.auditStatus === 'passed' ? '审核通过' : '审核驳回'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="viewProduct(scope.row)">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看
                        </el-button>
                        <el-button size="small" type="success" @click="auditProduct(scope.row, 'passed')"
                            v-if="scope.row.auditStatus === 'pending'">
                            <el-icon>
                                <Check />
                            </el-icon>
                            通过
                        </el-button>
                        <el-button size="small" type="danger" @click="auditProduct(scope.row, 'rejected')"
                            v-if="scope.row.auditStatus === 'pending'">
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
        <el-dialog v-model="showProductDetailDialog" title="商品详情" width="800px" :close-on-click-modal="false">
            <div class="product-detail">
                <el-row :gutter="20">
                    <!-- 商品图片 -->
                    <el-col :span="8">
                        <el-carousel height="300px" indicator-position="outside">
                            <el-carousel-item v-for="(img, index) in currentProduct.images" :key="index">
                                <img :src="img" alt="商品图片" style="width: 100%; height: 100%; object-fit: contain;" />
                            </el-carousel-item>
                        </el-carousel>
                    </el-col>

                    <!-- 商品基本信息 -->
                    <el-col :span="16">
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="商品ID" prop="id" />
                            <el-descriptions-item label="商品名称" :span="1" prop="productName" />
                            <el-descriptions-item label="所属店铺" prop="shopName" />
                            <el-descriptions-item label="商品分类">
                                <el-tag type="info">
                                    {{
                                        currentProduct.category === 'electronics' ? '电子产品' :
                                            currentProduct.category === 'clothing' ? '服装鞋帽' :
                                                currentProduct.category === 'food' ? '食品生鲜' :
                                                    currentProduct.category === 'home' ? '家居用品' : '美妆护肤'
                                    }}
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="商品价格">
                                <span style="color: var(--orange-dark); font-weight: 600;">¥{{ currentProduct.price
                                    }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="库存数量" prop="stockCount" />
                            <el-descriptions-item label="提交时间" prop="submitTime" />
                            <el-descriptions-item label="审核状态">
                                <el-tag :type="currentProduct.auditStatus === 'pending' ? 'warning' :
                                        currentProduct.auditStatus === 'passed' ? 'success' : 'danger'
                                    ">
                                    {{
                                        currentProduct.auditStatus === 'pending' ? '待审核' :
                                            currentProduct.auditStatus === 'passed' ? '审核通过' : '审核驳回'
                                    }}
                                </el-tag>
                            </el-descriptions-item>
                        </el-descriptions>
                    </el-col>
                </el-row>

                <!-- 商品详情 -->
                <el-card shadow="hover" style="margin-top: 20px;">
                    <template #header>
                        <span style="color: var(--orange-dark); font-weight: 600;">商品详情</span>
                    </template>
                    <div class="product-desc" v-html="currentProduct.description"></div>
                </el-card>

                <!-- 审核操作区 -->
                <div class="audit-actions" v-if="currentProduct.auditStatus === 'pending'"
                    style="margin-top: 20px; text-align: right;">
                    <el-button type="success" @click="auditProduct(currentProduct, 'passed')">
                        <el-icon>
                            <Check />
                        </el-icon>
                        审核通过
                    </el-button>
                    <el-button type="danger" @click="auditProduct(currentProduct, 'rejected')"
                        style="margin-left: 8px;">
                        <el-icon>
                            <Close />
                        </el-icon>
                        审核驳回
                    </el-button>
                </div>
            </div>
        </el-dialog>

        <!-- 审核弹窗 -->
        <el-dialog v-model="showAuditDialog" title="商品审核" width="500px" :close-on-click-modal="false">
            <el-form :model="auditForm" label-width="80px">
                <el-form-item label="审核结果">
                    <el-radio-group v-model="auditForm.result">
                        <el-radio label="passed">通过</el-radio>
                        <el-radio label="rejected">驳回</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="审核意见" v-if="auditForm.result === 'rejected'">
                    <el-input v-model="auditForm.opinion" type="textarea" :rows="4" placeholder="请输入驳回理由" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAuditDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmAudit">确认审核</el-button>
            </template>
        </el-dialog>

        <!-- 批量审核弹窗 -->
        <el-dialog v-model="showBatchAuditDialog" title="批量审核" width="500px" :close-on-click-modal="false">
            <el-form :model="batchAuditForm" label-width="80px">
                <el-form-item label="审核结果">
                    <el-radio-group v-model="batchAuditForm.result">
                        <el-radio label="passed">通过</el-radio>
                        <el-radio label="rejected">驳回</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="审核意见" v-if="batchAuditForm.result === 'rejected'">
                    <el-input v-model="batchAuditForm.opinion" type="textarea" :rows="4" placeholder="请输入驳回理由" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showBatchAuditDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmBatchAudit">确认批量审核</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Check, Close, Clock, Calendar } from '@element-plus/icons-vue'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
    productName: '',
    shopName: '',
    auditStatus: '',
    category: '',
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
const showAuditDialog = ref(false)
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

// 模拟获取商品列表
const fetchProducts = async () => {
    loading.value = true
    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 模拟数据
        productList.value = Array.from({ length: pagination.pageSize }, (_, index) => {
            const auditStatusList = ['pending', 'passed', 'rejected']
            const auditStatus = auditStatusList[Math.floor(Math.random() * auditStatusList.length)]
            const categoryList = ['electronics', 'clothing', 'food', 'home', 'cosmetics']
            const category = categoryList[Math.floor(Math.random() * categoryList.length)]

            return {
                id: (pagination.pageNum - 1) * pagination.pageSize + index + 1,
                productName: `商品${(pagination.pageNum - 1) * pagination.pageSize + index + 1} - ${['手机', '电脑', 'T恤', '零食', '家具'][Math.floor(Math.random() * 5)]}`,
                shopName: `店铺${Math.floor(Math.random() * 100)}`,
                category,
                price: (Math.random() * 1000 + 10).toFixed(2),
                stockCount: Math.floor(Math.random() * 1000) + 10,
                submitTime: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
                auditStatus,
                auditOpinion: auditStatus === 'rejected' ? '商品信息不符合平台规范' : '',
                images: [
                    `https://picsum.photos/400/400?random=${(pagination.pageNum - 1) * pagination.pageSize + index + 1}`,
                    `https://picsum.photos/400/400?random=${(pagination.pageNum - 1) * pagination.pageSize + index + 2}`
                ],
                description: `<p>这是商品的详细描述信息，包含商品的功能、特点、使用方法等。</p><p>商品材质：${['塑料', '金属', '纯棉', '实木'][Math.floor(Math.random() * 4)]}</p><p>商品尺寸：${Math.floor(Math.random() * 100)} x ${Math.floor(Math.random() * 100)} x ${Math.floor(Math.random() * 100)}mm</p>`
            }
        })

        pagination.total = 189 // 模拟总条数
    } catch (error) {
        ElMessage.error('获取商品列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 重置搜索
const resetSearch = () => {
    searchForm.productName = ''
    searchForm.shopName = ''
    searchForm.auditStatus = ''
    searchForm.category = ''
    searchForm.dateRange = []
    pagination.pageNum = 1
    fetchProducts()
}

// 查看商品详情
const viewProduct = (product) => {
    currentProduct.value = { ...product }
    showProductDetailDialog.value = true
}

// 审核商品
const auditProduct = (product, result) => {
    currentProduct.value = { ...product }
    auditForm.result = result
    auditForm.opinion = ''
    showAuditDialog.value = true
}

// 确认审核
const confirmAudit = async () => {
    if (auditForm.result === 'rejected' && !auditForm.opinion) {
        ElMessage.warning('请输入驳回理由')
        return
    }

    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 更新商品状态
        currentProduct.value.auditStatus = auditForm.result
        currentProduct.value.auditOpinion = auditForm.opinion

        // 更新列表中的状态
        const index = productList.value.findIndex(item => item.id === currentProduct.value.id)
        if (index !== -1) {
            productList.value[index].auditStatus = auditForm.result
            productList.value[index].auditOpinion = auditForm.opinion
        }

        ElMessage.success(`商品${auditForm.result === 'passed' ? '审核通过' : '审核驳回'}`)
        showAuditDialog.value = false
        showProductDetailDialog.value = false
    } catch (error) {
        ElMessage.error('审核操作失败')
        console.error(error)
    }
}

// 批量审核
const batchAudit = (result) => {
    if (selectedProducts.value.length === 0) {
        ElMessage.warning('请选择要审核的商品')
        return
    }

    batchAuditForm.result = result
    batchAuditForm.opinion = ''
    showBatchAuditDialog.value = true
}

// 确认批量审核
const confirmBatchAudit = async () => {
    if (batchAuditForm.result === 'rejected' && !batchAuditForm.opinion) {
        ElMessage.warning('请输入驳回理由')
        return
    }

    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 更新选中商品的状态
        selectedProducts.value.forEach(product => {
            const index = productList.value.findIndex(item => item.id === product.id)
            if (index !== -1) {
                productList.value[index].auditStatus = batchAuditForm.result
                productList.value[index].auditOpinion = batchAuditForm.opinion
            }
        })

        ElMessage.success(`成功${batchAuditForm.result === 'passed' ? '通过' : '驳回'}${selectedProducts.value.length}个商品`)
        showBatchAuditDialog.value = false

        // 清空选择
        productTableRef.value.clearSelection()
        selectedProducts.value = []
    } catch (error) {
        ElMessage.error('批量审核操作失败')
        console.error(error)
    }
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
    background: var(--orange-gradient-deep);
    border: none;
}

.el-button--primary:hover {
    background: var(--orange-gradient);
}

.el-button--success {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    border: none;
}

.el-button--danger {
    background: linear-gradient(135deg, #f44336 0%, #ff5722 100%);
    border: none;
}
</style>