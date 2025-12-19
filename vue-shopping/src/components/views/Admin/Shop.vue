<template>
    <div class="shop-management">
        <!-- 搜索筛选栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchShops">
                <el-form-item label="店铺名称">
                    <el-input v-model="searchForm.shopName" placeholder="请输入店铺名称" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="店主姓名">
                    <el-input v-model="searchForm.ownerName" placeholder="请输入店主姓名" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="店铺状态">
                    <el-select v-model="searchForm.status" placeholder="全部" clearable>
                        <el-option label="正常营业" value="normal" />
                        <el-option label="审核中" value="auditing" />
                        <el-option label="已关闭" value="closed" />
                        <el-option label="已冻结" value="frozen" />
                    </el-select>
                </el-form-item>
                <el-form-item label="店铺类型">
                    <el-select v-model="searchForm.type" placeholder="全部" clearable>
                        <el-option label="旗舰店" value="flagship" />
                        <el-option label="专营店" value="specialty" />
                        <el-option label="普通店" value="ordinary" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchShops">
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

        <!-- 店铺列表 -->
        <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
                <div class="table-header">
                    <span>店铺列表</span>
                    <el-button type="primary" size="small" @click="showAddShopDialog = true">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新增店铺
                    </el-button>
                </div>
            </template>

            <el-table :data="shopList"  stripe v-loading="loading" style="width: 100%;"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="店铺ID" width="80" />
                <el-table-column prop="shopName" label="店铺名称" min-width="150" />
                <el-table-column prop="ownerName" label="店主姓名" width="100" />
                <el-table-column prop="phone" label="联系电话" width="120" />
                <el-table-column prop="type" label="店铺类型" width="100">
                    <template #default="scope">
                        <el-tag type="info">
                            {{
                                scope.row.type === 'flagship' ? '旗舰店' :
                                    scope.row.type === 'specialty' ? '专营店' : '普通店'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" min-width="180" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 'normal' ? 'success' :
                                scope.row.status === 'auditing' ? 'warning' :
                                    scope.row.status === 'closed' ? 'info' : 'danger'
                            ">
                            {{
                                scope.row.status === 'normal' ? '正常营业' :
                                    scope.row.status === 'auditing' ? '审核中' :
                                        scope.row.status === 'closed' ? '已关闭' : '已冻结'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="salesVolume" label="销量" width="80" />
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="viewShop(scope.row)">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看
                        </el-button>
                        <el-button size="small" type="warning" @click="handleAudit(scope.row)"
                            v-if="scope.row.status === 'auditing'">
                            <el-icon>
                                <Check />
                            </el-icon>
                            审核
                        </el-button>
                        <el-button size="small" type="danger" @click="handleStatusChange(scope.row)"
                            v-if="scope.row.status === 'normal'">
                            <el-icon>
                                <Lock />
                            </el-icon>
                            冻结
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper" @size-change="fetchShops" @current-change="fetchShops"
                style="margin-top: 20px; text-align: right;" />
        </el-card>

        <!-- 新增店铺弹窗 -->
        <el-dialog v-model="showAddShopDialog" title="新增店铺" width="700px" :close-on-click-modal="false">
            <el-form :model="shopForm" label-width="100px" :rules="shopFormRules" ref="shopFormRef">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="店铺名称" prop="shopName">
                            <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="店铺类型" prop="type">
                            <el-select v-model="shopForm.type">
                                <el-option label="旗舰店" value="flagship" />
                                <el-option label="专营店" value="specialty" />
                                <el-option label="普通店" value="ordinary" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="店主姓名" prop="ownerName">
                            <el-input v-model="shopForm.ownerName" placeholder="请输入店主姓名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="联系电话" prop="phone">
                            <el-input v-model="shopForm.phone" placeholder="请输入联系电话" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="店铺地址" prop="address">
                    <el-input v-model="shopForm.address" placeholder="请输入店铺详细地址" />
                </el-form-item>
                <el-form-item label="店铺简介" prop="intro">
                    <el-input v-model="shopForm.intro" type="textarea" :rows="4" placeholder="请输入店铺简介" />
                </el-form-item>
                <el-form-item label="营业执照" prop="license">
                    <el-upload class="upload-demo" action="#" :on-preview="handlePreview" :on-remove="handleRemove"
                        :before-upload="beforeUpload" :file-list="fileList" accept=".jpg,.png,.pdf" :limit="1">
                        <el-button type="primary">点击上传</el-button>
                        <template #tip>
                            <div class="el-upload__tip">
                                只能上传jpg/png/pdf文件，且不超过2MB
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddShopDialog = false">取消</el-button>
                <el-button type="primary" @click="saveShop">确认</el-button>
            </template>
        </el-dialog>

        <!-- 店铺详情弹窗 -->
        <el-dialog v-model="showShopDetailDialog" title="店铺详情" width="800px" :close-on-click-modal="false">
            <el-descriptions :column="3" border :data="currentShop">
                <el-descriptions-item label="店铺ID" prop="id" />
                <el-descriptions-item label="店铺名称" prop="shopName" />
                <el-descriptions-item label="店铺类型">
                    <el-tag type="info">
                        {{
                            currentShop.type === 'flagship' ? '旗舰店' :
                                currentShop.type === 'specialty' ? '专营店' : '普通店'
                        }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="店主姓名" prop="ownerName" />
                <el-descriptions-item label="联系电话" prop="phone" />
                <el-descriptions-item label="店铺状态">
                    <el-tag :type="currentShop.status === 'normal' ? 'success' :
                            currentShop.status === 'auditing' ? 'warning' :
                                currentShop.status === 'closed' ? 'info' : 'danger'
                        ">
                        {{
                            currentShop.status === 'normal' ? '正常营业' :
                                currentShop.status === 'auditing' ? '审核中' :
                                    currentShop.status === 'closed' ? '已关闭' : '已冻结'
                        }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间" prop="createTime" />
                <el-descriptions-item label="最后审核时间" prop="auditTime" />
                <el-descriptions-item label="销量" prop="salesVolume" />
                <el-descriptions-item label="评分" prop="score" />
                <el-descriptions-item label="店铺地址" :span="2" prop="address" />
                <el-descriptions-item label="店铺简介" :span="3" prop="intro" />
            </el-descriptions>

            <!-- 店铺数据统计 -->
            <div style="margin-top: 20px;">
                <h4 style="color: var(--orange-dark); margin-bottom: 10px;">经营数据</h4>
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px;">
                            <div class="stat-item">
                                <p class="stat-label">今日订单</p>
                                <p class="stat-value">{{ currentShop.todayOrders }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px;">
                            <div class="stat-item">
                                <p class="stat-label">本月销售额</p>
                                <p class="stat-value">¥{{ currentShop.monthSales }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px;">
                            <div class="stat-item">
                                <p class="stat-label">累计订单</p>
                                <p class="stat-value">{{ currentShop.totalOrders }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px;">
                            <div class="stat-item">
                                <p class="stat-label">商品总数</p>
                                <p class="stat-value">{{ currentShop.productCount }}</p>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>

        <!-- 审核弹窗 -->
        <el-dialog v-model="showAuditDialog" title="店铺审核" width="500px" :close-on-click-modal="false">
            <el-form :model="auditForm" label-width="80px">
                <el-form-item label="审核结果">
                    <el-radio-group v-model="auditForm.result">
                        <el-radio label="pass">通过</el-radio>
                        <el-radio label="reject">驳回</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="审核意见" v-if="auditForm.result === 'reject'">
                    <el-input v-model="auditForm.opinion" type="textarea" :rows="4" placeholder="请输入驳回理由" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAuditDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmAudit">确认审核</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Check, Lock, Upload } from '@element-plus/icons-vue'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
    shopName: '',
    ownerName: '',
    status: '',
    type: ''
})

// 分页参数
const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

// 店铺列表
const shopList = ref([])

// 弹窗状态
const showAddShopDialog = ref(false)
const showShopDetailDialog = ref(false)
const showAuditDialog = ref(false)

// 当前选中店铺
const currentShop = ref({})

// 店铺表单
const shopFormRef = ref(null)
const shopForm = reactive({
    shopName: '',
    ownerName: '',
    phone: '',
    type: 'ordinary',
    address: '',
    intro: '',
    license: ''
})

// 上传文件列表
const fileList = ref([])

// 审核表单
const auditForm = reactive({
    result: '',
    opinion: ''
})

// 表单验证规则
const shopFormRules = reactive({
    shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
    ownerName: [{ required: true, message: '请输入店主姓名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请选择店铺类型', trigger: 'change' }],
    address: [{ required: true, message: '请输入店铺地址', trigger: 'blur' }],
    license: [{ required: true, message: '请上传营业执照', trigger: 'change' }]
})

// 模拟获取店铺列表
const fetchShops = async () => {
    loading.value = true
    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 模拟数据
        shopList.value = Array.from({ length: pagination.pageSize }, (_, index) => ({
            id: (pagination.pageNum - 1) * pagination.pageSize + index + 1,
            shopName: `店铺${(pagination.pageNum - 1) * pagination.pageSize + index + 1}`,
            ownerName: `店主${(pagination.pageNum - 1) * pagination.pageSize + index + 1}`,
            phone: `138${Math.floor(Math.random() * 100000000)}`,
            type: ['flagship', 'specialty', 'ordinary'][Math.floor(Math.random() * 3)],
            createTime: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
            auditTime: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
            status: ['normal', 'auditing', 'closed', 'frozen'][Math.floor(Math.random() * 4)],
            salesVolume: Math.floor(Math.random() * 10000),
            score: (Math.random() * 1 + 4).toFixed(1),
            address: `北京市朝阳区${Math.floor(Math.random() * 100)}号`,
            intro: `这是一家经营${['电子产品', '服装', '食品', '家居'][Math.floor(Math.random() * 4)]}的店铺`,
            todayOrders: Math.floor(Math.random() * 100),
            monthSales: Math.floor(Math.random() * 100000),
            totalOrders: Math.floor(Math.random() * 10000),
            productCount: Math.floor(Math.random() * 500)
        }))

        pagination.total = 128 // 模拟总条数
    } catch (error) {
        ElMessage.error('获取店铺列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 重置搜索
const resetSearch = () => {
    searchForm.shopName = ''
    searchForm.ownerName = ''
    searchForm.status = ''
    searchForm.type = ''
    pagination.pageNum = 1
    fetchShops()
}

// 查看店铺详情
const viewShop = (shop) => {
    currentShop.value = { ...shop }
    showShopDetailDialog.value = true
}

// 审核店铺
const handleAudit = (shop) => {
    currentShop.value = { ...shop }
    auditForm.result = ''
    auditForm.opinion = ''
    showAuditDialog.value = true
}

// 确认审核
const confirmAudit = async () => {
    if (!auditForm.result) {
        ElMessage.warning('请选择审核结果')
        return
    }

    if (auditForm.result === 'reject' && !auditForm.opinion) {
        ElMessage.warning('请输入驳回理由')
        return
    }

    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 更新店铺状态
        currentShop.value.status = auditForm.result === 'pass' ? 'normal' : 'closed'

        // 更新列表中的状态
        const index = shopList.value.findIndex(item => item.id === currentShop.value.id)
        if (index !== -1) {
            shopList.value[index].status = currentShop.value.status
        }

        ElMessage.success(`店铺${auditForm.result === 'pass' ? '审核通过' : '审核驳回'}`)
        showAuditDialog.value = false
    } catch (error) {
        ElMessage.error('审核操作失败')
        console.error(error)
    }
}

// 冻结/解冻店铺
const handleStatusChange = async (shop) => {
    try {
        await ElMessageBox.confirm(
            `确认要${shop.status === 'normal' ? '冻结' : '解冻'}该店铺吗？`,
            '提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: shop.status === 'normal' ? 'warning' : 'info'
            }
        )

        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 500))

        // 更新状态
        shop.status = shop.status === 'normal' ? 'frozen' : 'normal'
        ElMessage.success(`店铺${shop.status === 'frozen' ? '冻结' : '解冻'}成功`)
    } catch (error) {
        ElMessage.info('已取消操作')
    }
}

// 保存店铺
const saveShop = async () => {
    try {
        await shopFormRef.value.validate()

        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        ElMessage.success('店铺创建成功，等待审核')
        showAddShopDialog.value = false

        // 重置表单
        Object.assign(shopForm, {
            shopName: '',
            ownerName: '',
            phone: '',
            type: 'ordinary',
            address: '',
            intro: '',
            license: ''
        })
        fileList.value = []

        // 重新获取列表
        fetchShops()
    } catch (error) {
        console.error(error)
    }
}

// 文件上传相关方法
const handleRemove = (file, uploadFiles) => {
    console.log(file, uploadFiles)
}

const handlePreview = (file) => {
    console.log(file)
}

const beforeUpload = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        ElMessage.error('文件大小不能超过2MB!')
        return false
    }
    return true
}

// 监听选择事件
const handleSelectionChange = (val) => {
    console.log('选中的店铺：', val)
}

// 初始化
onMounted(() => {
    fetchShops()
})
</script>

<style scoped>
.shop-management {
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

.el-descriptions {
    --el-descriptions-label-color: var(--orange-dark);
    --el-descriptions-content-color: #666;
}

.stat-item {
    text-align: center;
}

.stat-label {
    color: #999;
    font-size: 14px;
    margin: 0 0 4px 0;
}

.stat-value {
    color: var(--orange-dark);
    font-size: 20px;
    font-weight: 600;
    margin: 0;
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

.el-button--danger {
    background: linear-gradient(135deg, #f44336 0%, #ff5722 100%);
    border: none;
}
</style>