<template>
    <el-main class="shop-order-main">
        <el-card class="order-card">
            <template #header>
                <div class="order-header">
                    <span>店铺订单<span style="font-size: 12px;color: #ff5000;">（点击订单编号查看订单详情）</span></span>
                    <el-button type="text" @click="goBack" class="back-button">
                        返回 <i class="el-icon-arrow-left"></i></el-button>
                </div>
            </template>

            <el-table :data="orderList" row-key="id" show-overflow-tooltip>
                <el-table-column label="订单编号" width="180">
                    <template #default="{ row }">
                        <span style="color: #409eff; cursor: pointer;" @click="goOrderDetail(row)">
                            {{ row.orderNumber }}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column label="订单状态" width="120">
                    <template #default="{ row }">{{ row.status }}</template>
                </el-table-column>

                <el-table-column label="下单时间" width="120">
                    <template #default="{ row }">{{ row.date }}</template>
                </el-table-column>

                <el-table-column label="商品" min-width="220">
                    <template #default="{ row }">
                        <div class="goods-box" @click="goProductDetail(row.productId)">
                            <img :src="row.img" class="goods-img" />
                            <div class="goods-title">{{ row.title }}</div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="单价" width="100">
                    <template #default="{ row }">¥{{ row.price }}</template>
                </el-table-column>

                <el-table-column label="数量" width="100">
                    <template #default="{ row }">{{ row.num }}</template>
                </el-table-column>

                <el-table-column label="小计" width="100">
                    <template #default="{ row }">¥{{ (row.price * row.num).toFixed(2) }}</template>
                </el-table-column>

                <el-table-column label="买家" width="120">
                    <template #default="{ row }">{{ row.buyerName }}</template>
                </el-table-column>

                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <!-- 待发货：发货 -->
                        <div v-if="row.status === '待发货'">
                            <el-button type="primary" size="small" @click="shipOrder(row)">发货</el-button>
                        </div>

                        <!-- 已完成：查看评价 -->
                        <div v-else-if="row.status === '已完成'">
                            <el-button type="warning" size="small" @click="goReview(row)">查看评价</el-button>
                        </div>

                        <span v-else>--</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const orderList = ref([])
const targetStatus = Number(route.params.id)   // 0=全部 1=待付款 2=待发货 3=待收货 4=已完成 5=已取消
const statusMap = { 1: '待付款', 2: '待发货', 3: '待收货', 4: '已完成', 5: '已取消' }

/* 拉取店铺订单 */
const fetchShopOrders = async () => {
    try {
        const raw = localStorage.getItem('system-user')
        const user = raw ? JSON.parse(raw) : null
        if (!user?.id) {
            ElMessage.warning('请先登录')
            return
        }

        // ① 先拿店铺 id
        const shopRes = await request.get(`/api/shop/list/${user.id}`)
        if (!shopRes.data?.length) {
            ElMessage.info('您还未开设店铺')
            return
        }
        const shopId = shopRes.data[0].id

        // ② 再根据店铺 id 拉订单
        const { data } = await request.get(`/api/order/list2/${shopId}`)
        orderList.value = (Array.isArray(data) ? data : data.data ?? []).map(item => ({
            id: item.id,
            orderNumber: item.id,
            productId: item.productId,
            statusNumber: item.status,
            status: statusMap[item.status] ?? '未知',
            date: item.createTime.slice(0, 3).join('-'),
            img: `data:image/png;base64,${item.productImage || ''}`,
            title: item.productName,
            price: item.price,
            num: item.quantity,
        }))
            .filter(item => targetStatus !== 0 ? item.statusNumber === targetStatus : true)
    } catch (e) {
        ElMessage.error('获取店铺订单失败')
    }
}

const statusColor = st => ({ 待付款: 'warning', 待发货: 'primary', 待收货: 'info', 已完成: 'success', 已取消: 'danger' }[st] ?? 'info')

/* 店铺侧操作 */
const shipOrder = async (row) => {
    await request.post('/api/order/update', { id: row.id, status: 3 })
    ElMessage.success('已发货')
    fetchShopOrders()
}
const showLogistics = (row) => {
    ElMessage.info('物流功能待实现')
}
const goReview = (row) => {
    router.push(`/shop/review/${row.id}`)
}
const goBack = () => router.back()
const goOrderDetail = (row) => {
    router.push(`/user/orderdetail/${row.id}`)
}
const goProductDetail = (id) => router.push(`/product/${id}`)

onMounted(fetchShopOrders)
</script>

<style scoped>
.shop-order-main {
    background-color: #f5f5f5;
    padding: 20px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

.goods-box {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.goods-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.goods-title {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>