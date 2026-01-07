<template>
    <div class="order-management">
        <!-- 搜索筛选栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchOrders">
                <el-form-item label="订单编号">
                    <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="用户名称">
                    <el-input v-model="searchForm.username" placeholder="请输入用户名称" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="店铺名称">
                    <el-input v-model="searchForm.shopName" placeholder="请输入店铺名称" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select v-model="searchForm.status" placeholder="全部" clearable>
                        <el-option label="待付款" value="pending_payment" />
                        <el-option label="待发货" value="pending_delivery" />
                        <el-option label="待收货" value="pending_receipt" />
                        <el-option label="已完成" value="completed" />
                        <el-option label="已取消" value="cancelled" />
                        <el-option label="退款中" value="refunding" />
                    </el-select>
                </el-form-item>
                <el-form-item label="下单时间">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchOrders">
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

        <!-- 订单统计 -->
        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">今日订单数</p>
                        <p class="stat-value">{{ statData.todayOrderCount }}</p>
                        <p class="stat-change"
                            :class="{ 'text-green': statData.todayOrderRate > 0, 'text-red': statData.todayOrderRate < 0 }">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                            {{ statData.todayOrderRate > 0 ? '+' : '' }}{{ statData.todayOrderRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">今日销售额</p>
                        <p class="stat-value">¥{{ statData.todaySalesAmount }}</p>
                        <p class="stat-change"
                            :class="{ 'text-green': statData.todaySalesRate > 0, 'text-red': statData.todaySalesRate < 0 }">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                            {{ statData.todaySalesRate > 0 ? '+' : '' }}{{ statData.todaySalesRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">本周订单数</p>
                        <p class="stat-value">{{ statData.weekOrderCount }}</p>
                        <p class="stat-change"
                            :class="{ 'text-green': statData.weekOrderRate > 0, 'text-red': statData.weekOrderRate < 0 }">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                            {{ statData.weekOrderRate > 0 ? '+' : '' }}{{ statData.weekOrderRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-content">
                        <p class="stat-label">本周销售额</p>
                        <p class="stat-value">¥{{ statData.weekSalesAmount }}</p>
                        <p class="stat-change"
                            :class="{ 'text-green': statData.weekSalesRate > 0, 'text-red': statData.weekSalesRate < 0 }">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                            {{ statData.weekSalesRate > 0 ? '+' : '' }}{{ statData.weekSalesRate }}%
                        </p>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 订单列表 -->
        <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
                <div class="table-header">
                    <span>订单列表</span>
                    <el-button type="primary" size="small" @click="exportOrders">
                        <el-icon>
                            <Download />
                        </el-icon>
                        导出订单
                    </el-button>
                </div>
            </template>

            <el-table :data="orderList" stripe v-loading="loading" style="width: 100%;"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="orderNo" label="订单编号" min-width="180" />
                <el-table-column prop="username" label="用户名称" width="100" />
                <el-table-column prop="shopName" label="店铺名称" width="120" />
                <el-table-column prop="productCount" label="商品数量" width="80" />
                <el-table-column prop="totalAmount" label="订单金额" width="100">
                    <template #default="scope">
                        <span style="color: var(--orange-dark); font-weight: 600;">¥{{ scope.row.totalAmount }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="下单时间" min-width="180" />
                <el-table-column prop="status" label="订单状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 'pending_payment' ? 'warning' :
                            scope.row.status === 'pending_delivery' ? 'info' :
                                scope.row.status === 'pending_receipt' ? 'primary' :
                                    scope.row.status === 'completed' ? 'success' :
                                        scope.row.status === 'refunding' ? 'danger' : 'gray'
                            ">
                            {{
                                scope.row.status === 'pending_payment' ? '待付款' :
                                    scope.row.status === 'pending_delivery' ? '待发货' :
                                        scope.row.status === 'pending_receipt' ? '待收货' :
                                            scope.row.status === 'completed' ? '已完成' :
                                                scope.row.status === 'refunding' ? '退款中' : '已取消'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="paymentMethod" label="支付方式" width="100">
                    <template #default="scope">
                        <el-tag type="info">{{ scope.row.paymentMethod || '未支付' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="viewOrder(scope.row)">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看
                        </el-button>
                        <el-button size="small" type="warning" @click="handleCancelOrder(scope.row)"
                            v-if="['pending_payment', 'pending_delivery'].includes(scope.row.status)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                            取消
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper" @size-change="fetchOrders"
                @current-change="fetchOrders" style="margin-top: 20px; text-align: right;" />
        </el-card>

        <!-- 订单详情弹窗 -->
        <el-dialog v-model="showOrderDetailDialog" title="订单详情" width="800px" :close-on-click-modal="false">
            <div class="order-detail">
                <!-- 订单基本信息 -->
                <el-descriptions :column="3" :data="currentOrder" style="margin-bottom: 20px;">
                    <el-descriptions-item label="订单编号" prop="orderNo" />
                    <el-descriptions-item label="用户名称" prop="username" />
                    <el-descriptions-item label="店铺名称" prop="shopName" />
                    <el-descriptions-item label="订单金额">
                        <span style="color: var(--orange-dark); font-weight: 600;">¥{{ currentOrder.totalAmount
                            }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="支付方式" prop="paymentMethod" />
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="currentOrder.status === 'pending_payment' ? 'warning' :
                            currentOrder.status === 'pending_delivery' ? 'info' :
                                currentOrder.status === 'pending_receipt' ? 'primary' :
                                    currentOrder.status === 'completed' ? 'success' :
                                        currentOrder.status === 'refunding' ? 'danger' : 'gray'
                            ">
                            {{
                                currentOrder.status === 'pending_payment' ? '待付款' :
                                    currentOrder.status === 'pending_delivery' ? '待发货' :
                                        currentOrder.status === 'pending_receipt' ? '待收货' :
                                            currentOrder.status === 'completed' ? '已完成' :
                                                currentOrder.status === 'refunding' ? '退款中' : '已取消'
                            }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="下单时间" prop="createTime" />
                    <el-descriptions-item label="支付时间" prop="payTime" />
                    <el-descriptions-item label="发货时间" prop="deliveryTime" />
                </el-descriptions>

                <!-- 收货地址 -->
                <el-card shadow="hover" style="margin-bottom: 20px;">
                    <template #header>
                        <span style="color: var(--orange-dark); font-weight: 600;">收货地址</span>
                    </template>
                    <div class="address-info">
                        {{ currentOrder.address }}
                        <br>
                        收货人：{{ currentOrder.receiver }} 联系电话：{{ currentOrder.receiverPhone }}
                    </div>
                </el-card>

                <!-- 商品列表 -->
                <el-card shadow="hover">
                    <template #header>
                        <span style="color: var(--orange-dark); font-weight: 600;">商品清单</span>
                    </template>
                    <el-table :data="currentOrder.productList" border>
                        <el-table-column prop="productName" label="商品名称" min-width="200" />
                        <el-table-column prop="specs" label="规格" width="120" />
                        <el-table-column prop="price" label="单价" width="100">
                            <template #default="scope">
                                ¥{{ scope.row.price }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="count" label="数量" width="80" />
                        <el-table-column prop="amount" label="小计" width="100">
                            <template #default="scope">
                                ¥{{ scope.row.amount }}
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 订单金额汇总 -->
                    <div class="amount-summary" style="margin-top: 10px; text-align: right;">
                        <p>商品总价：¥{{ currentOrder.productAmount }}</p>
                        <p>运费：¥{{ currentOrder.freightAmount }}</p>
                        <p>优惠金额：¥{{ currentOrder.discountAmount }}</p>
                        <p style="font-weight: 600; color: var(--orange-dark);">实付金额：¥{{ currentOrder.totalAmount }}</p>
                    </div>
                </el-card>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Delete, Download, TrendCharts } from '@element-plus/icons-vue'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
    orderNo: '',
    username: '',
    shopName: '',
    status: '',
    dateRange: []
})

// 分页参数
const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

// 订单列表
const orderList = ref([])

// 统计数据
const statData = reactive({
    todayOrderCount: 128,
    todayOrderRate: 8.5,
    todaySalesAmount: 25689.56,
    todaySalesRate: 12.3,
    weekOrderCount: 856,
    weekOrderRate: 5.2,
    weekSalesAmount: 185698.78,
    weekSalesRate: 9.8
})

// 弹窗状态
const showOrderDetailDialog = ref(false)

// 当前选中订单
const currentOrder = ref({})

// 模拟获取订单列表
const fetchOrders = async () => {
    loading.value = true
    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 模拟数据
        orderList.value = Array.from({ length: pagination.pageSize }, (_, index) => {
            const statusList = ['pending_payment', 'pending_delivery', 'pending_receipt', 'completed', 'cancelled', 'refunding']
            const status = statusList[Math.floor(Math.random() * statusList.length)]
            const totalAmount = (Math.random() * 1000 + 10).toFixed(2)

            return {
                id: (pagination.pageNum - 1) * pagination.pageSize + index + 1,
                orderNo: `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`,
                username: `user${Math.floor(Math.random() * 1000)}`,
                shopName: `店铺${Math.floor(Math.random() * 100)}`,
                productCount: Math.floor(Math.random() * 10) + 1,
                totalAmount,
                createTime: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
                payTime: status !== 'pending_payment' && status !== 'cancelled' ? '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0') : '-',
                deliveryTime: status === 'pending_receipt' || status === 'completed' ? '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0') : '-',
                status,
                paymentMethod: status === 'pending_payment' || status === 'cancelled' ? '未支付' : ['微信支付', '支付宝', '银行卡'][Math.floor(Math.random() * 3)],
                address: `北京市朝阳区${Math.floor(Math.random() * 100)}号${Math.floor(Math.random() * 100)}单元${Math.floor(Math.random() * 1000)}室`,
                receiver: `收货人${Math.floor(Math.random() * 1000)}`,
                receiverPhone: `138${Math.floor(Math.random() * 100000000)}`,
                productAmount: (Math.random() * 1000 + 10).toFixed(2),
                freightAmount: Math.floor(Math.random() * 20) + 5,
                discountAmount: (Math.random() * 50).toFixed(2),
                productList: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
                    productName: `商品${i + 1} - ${['手机', '电脑', '服装', '食品', '家居'][Math.floor(Math.random() * 5)]}`,
                    specs: `${['红色', '蓝色', '黑色'][Math.floor(Math.random() * 3)]} / ${['XL', 'L', 'M'][Math.floor(Math.random() * 3)]}`,
                    price: (Math.random() * 500 + 10).toFixed(2),
                    count: Math.floor(Math.random() * 5) + 1,
                    amount: ((Math.random() * 500 + 10) * (Math.floor(Math.random() * 5) + 1)).toFixed(2)
                }))
            }
        })

        pagination.total = 235 // 模拟总条数
    } catch (error) {
        ElMessage.error('获取订单列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 重置搜索
const resetSearch = () => {
    searchForm.orderNo = ''
    searchForm.username = ''
    searchForm.shopName = ''
    searchForm.status = ''
    searchForm.dateRange = []
    pagination.pageNum = 1
    fetchOrders()
}

// 查看订单详情
const viewOrder = (order) => {
    currentOrder.value = { ...order }
    showOrderDetailDialog.value = true
}

// 取消订单
const handleCancelOrder = async (order) => {
    try {
        await ElMessageBox.confirm(
            '确认要取消该订单吗？',
            '提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 更新订单状态
        order.status = 'cancelled'
        ElMessage.success('订单已取消')
    } catch (error) {
        ElMessage.info('已取消操作')
    }
}

// 导出订单
const exportOrders = async () => {
    try {
        loading.value = true
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        ElMessage.success('订单导出成功，文件已下载')
    } catch (error) {
        ElMessage.error('订单导出失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 监听选择事件
const handleSelectionChange = (val) => {
    console.log('选中的订单：', val)
}

// 初始化
onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
.order-management {
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

.order-detail {
    padding: 10px 0;
}

.address-info {
    padding: 10px;
    line-height: 1.6;
    color: #666;
}

.amount-summary {
    padding: 10px;
    line-height: 1.8;
    color: #666;
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

.el-button--warning {
    background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
    border: none;
}
</style>