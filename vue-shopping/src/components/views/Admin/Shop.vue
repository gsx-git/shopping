<template>
    <div class="shop-management">
        <!-- 搜索栏（仅店铺名称 + 状态） -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchShops">
                <el-form-item label="店铺名称">
                    <el-input v-model="searchForm.shopName" placeholder="请输入店铺名称" clearable style="width: 200px" />
                </el-form-item>
                <el-form-item label="店铺状态">
                    <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px">
                        <el-option label="正常营业" :value=1 />
                        <el-option label="审核中" :value=0 />
                        <el-option label="已冻结" :value=2 />
                        <el-option label="已关闭" :value=3 />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchShops">
                        <el-icon>
                            <Search />
                        </el-icon> 搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon>
                            <Refresh />
                        </el-icon> 重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 店铺列表 -->
        <el-card class="table-card" style="margin-top: 20px">
            <template #header>
                <div class="table-header">
                    <span>店铺列表</span>
                </div>
            </template>

            <el-table :data="shopList" stripe v-loading="loading" style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="店铺ID" width="80" />
                <el-table-column prop="name" label="店铺名称" min-width="150" />
                <el-table-column label="创建时间" min-width="100">
                    <template #default="scope">
                        {{ formatTime(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <el-tag
                            :type="scope.row.status === 1 ? 'success' : scope.row.status === 0 ? 'warning' : 'info'">
                            {{ scope.row.status === 1 ? '正常营业' : scope.row.status === 0 ? '审核中' : '已冻结' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="viewShop(scope.row)">
                            <el-icon>
                                <View />
                            </el-icon> 查看
                        </el-button>
                        <el-button v-if="scope.row.status === 0" size="small" type="warning"
                            @click="handleAudit(scope.row)">
                            <el-icon>
                                <Check />
                            </el-icon> 审核
                        </el-button>
                        <el-button v-if="scope.row.status === 1" size="small" type="danger"
                            @click="handleStatusChange(scope.row)">
                            <el-icon>
                                <Lock />
                            </el-icon> 冻结
                        </el-button>
                        <el-button v-if="scope.row.status === 2" size="small" type="primary"
                            @click="handleStatusChange(scope.row)">
                            <el-icon>
                                <Lock />
                            </el-icon> 解冻
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper" @size-change="fetchShops" @current-change="fetchShops"
                style="margin-top: 20px; text-align: right" />
        </el-card>

        <!-- 店铺详情 -->
        <el-dialog v-model="showShopDetailDialog" title="店铺详情" width="800px" :close-on-click-modal="false">
            <el-descriptions :column="3">
                <el-descriptions-item label="店铺ID">{{ currentShop.id }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatTime(currentShop.createTime) }}</el-descriptions-item>
                <!-- <el-descriptions-item label="店铺类型">
                    <el-tag type="info">
                        {{ currentShop.type === 'flagship' ? '旗舰店' : currentShop.type === 'specialty' ? '专营店' : '普通店' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="店主姓名">{{ currentShop.userName }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ currentShop.phone }}</el-descriptions-item> -->
                <el-descriptions-item label="店铺状态">
                    <el-tag
                        :type="currentShop.status === 1 ? 'success' : currentShop.status === 0 ? 'warning' : 'info'">
                        {{ currentShop.status === 1 ? '正常营业' : currentShop.status === 0 ? '审核中' : '已关闭' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="店铺名称">{{ currentShop.name }}</el-descriptions-item>
                <!-- <el-descriptions-item label="店铺地址" :span="2">{{ currentShop.address || '-' }}</el-descriptions-item> -->
                <el-descriptions-item label="店铺简介" :span="3">{{ currentShop.description || '-' }}</el-descriptions-item>
            </el-descriptions>

            <!-- 经营数据 -->
            <div style="margin-top: 20px">
                <h4 style="color: var(--orange-dark); margin-bottom: 10px">经营数据</h4>
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px">
                            <div class="stat-item">
                                <p class="stat-label">今日订单</p>
                                <p class="stat-value">{{ currentShop.todayOrders || 0 }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px">
                            <div class="stat-item">
                                <p class="stat-label">本月销售额</p>
                                <p class="stat-value">¥{{ currentShop.monthSales || 0 }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px">
                            <div class="stat-item">
                                <p class="stat-label">累计订单</p>
                                <p class="stat-value">{{ currentShop.totalOrders || 0 }}</p>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" body-style="padding: 10px">
                            <div class="stat-item">
                                <p class="stat-label">商品总数</p>
                                <p class="stat-value">{{ currentShop.productCount || 0 }}</p>
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
                <el-form-item v-if="auditForm.result === 'reject'" label="审核意见">
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
import { Search, Refresh, View, Check, Lock } from '@element-plus/icons-vue'
import request from '@/utils/request'
import axios from 'axios'

/* ------------------ 基础状态 ------------------ */
const loading = ref(false)
const shopList = ref([])
const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

/* ------------------ 搜索 ------------------ */
const searchForm = reactive({
    shopName: '',
    status: ''
})
function resetSearch() {
    searchForm.shopName = ''
    searchForm.status = ''
    pagination.pageNum = 1
    fetchShops()
}

/* ------------------ 表格数据 ------------------ */
async function fetchShops() {
    loading.value = true
    try {
        const res = await request.post('/api/shop/listAll', {
            pageSize: pagination.pageSize,
            pageNum: pagination.pageNum,
            param: {
                name: searchForm.shopName || null,
                status: searchForm.status === '' ? null : Number(searchForm.status)
            }
        })
        shopList.value = res.data || []
        pagination.total = res.total || 0
    } catch (e) {
        ElMessage.error('获取店铺列表失败')
    } finally {
        loading.value = false
    }
}
function formatTime(arr) {
    if (!Array.isArray(arr) || arr.length < 6) return '-'
    const [y, M, d, h, m, s] = arr
    return `${y}-${String(M).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(
        h
    ).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ------------------ 查看详情 ------------------ */
const showShopDetailDialog = ref(false)
const currentShop = ref({})
function viewShop(row) {
    currentShop.value = { ...row }
    showShopDetailDialog.value = true
}

/* ------------------ 审核 ------------------ */
const showAuditDialog = ref(false)
const auditForm = reactive({ result: '', opinion: '' })
function handleAudit(row) {
    currentShop.value = { ...row }
    auditForm.result = ''
    auditForm.opinion = ''
    showAuditDialog.value = true
}
async function confirmAudit() {
    if (!auditForm.result) {
        ElMessage.warning('请选择审核结果')
        return
    }
    // if (auditForm.result === 'reject' && !auditForm.opinion) {
    //     ElMessage.warning('请输入驳回理由')
    //     return
    // }

    try {
        const newStatus = auditForm.result === 'pass' ? 1 : 2

        /* 1. 组装 DTO（只传 shopId + status，其余字段 null） */
        const dto = {
            shopId: currentShop.value.id,
            name: null,
            description: null,
            idcardNo: null,
            status: newStatus
        }
        const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })

        /* 2. FormData：字段名必须和后端 @RequestPart 完全一致 */
        const fd = new FormData()
        fd.append('shopUpdateDTO', dtoBlob)   // 对应 @RequestPart("shopUpdateDTO")
        fd.append('logo', null)    
        fd.append('licenseUrl', null) 

        /* 3. 发请求 */
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/shop/update`, fd)

        /* 4. 本地同步 & 提示 */
        const idx = shopList.value.findIndex(v => v.id === currentShop.value.id)
        if (idx > -1) shopList.value[idx].status = newStatus
        ElMessage.success(auditForm.result === 'pass' ? '审核通过' : '已驳回')
        showAuditDialog.value = false
    } catch (e) {
        ElMessage.error('审核操作失败')
    }
}

/* -------------------- 冻结 / 解冻 -------------------- */
async function handleStatusChange(row) {
    const opName = row.status === 1 ? '冻结' : '解冻'
    try {
        await ElMessageBox.confirm(
            `确认要${opName}该店铺吗？`,
            '提示',
            { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
        )
        const newStatus = row.status === 1 ? 2 : 1

        /* 1. DTO */
        const dto = {
            shopId: row.id,
            name: null,
            description: null,
            idcardNo: null,
            status: newStatus
        }
        const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })
        /* 2. FormData */
        const fd = new FormData()
        fd.append('shopUpdateDTO', dtoBlob)
        fd.append('logo', null)
        fd.append('licenseUrl', null)
        /* 3. 请求 */
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/shop/update`, fd)
        /* 4. 本地同步 */
        row.status = newStatus
        ElMessage.success(`${opName}成功`)
    } catch {
        ElMessage.info('已取消操作')
    }
}

function handleSelectionChange(val) {
    console.log('选中的店铺：', val)
}

onMounted(() => fetchShops())
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
    --el-table-row-hover-bg-color: rgba(255, 120, 0, .05);
    --el-table-current-row-bg-color: rgba(255, 120, 0, .1);
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
    /* background: var(--orange-gradient-deep); */
    border: none;
}

.el-button--primary:hover {
    /* background: var(--orange-gradient); */
    border: none;
}

.el-button--danger {
    background: linear-gradient(135deg, #f44336 0%, #ff5722 100%);
    border: none;
}
</style>