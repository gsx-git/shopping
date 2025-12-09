<template>
  <el-main class="order-detail-main">
    <!-- 订单详情卡片 -->
    <el-card class="order-card">
      <template #header>
        <div class="order-header">
          <span>我的订单</span>
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>
      <el-table :data="orderList" row-key="id" show-overflow-tooltip>
        <el-table-column label="订单编号" width="180">
          <template #default="{ row }">{{ row.orderNumber }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120">
          <template #default="{ row }">{{ row.status }}</template>
        </el-table-column>
        <el-table-column label="下单时间" width="120">
          <template #default="{ row }">{{ row.date }}</template>
        </el-table-column>
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <div class="goods-box">
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <!-- 已取消：无操作 -->
            <span v-if="row.status === '已取消'">--</span>

            <!-- 待付款：支付 + 取消 -->
            <div v-else-if="row.status === '待付款'">
              <el-button type="success" size="small" @click="payOrder(row)">支付</el-button>
              <el-button type="danger" size="small" link @click="cancelOrder(row)">取消订单</el-button>
            </div>

            <!-- 待发货：取消订单 -->
            <div v-else-if="row.status === '待发货'">
              <el-button type="danger" size="small" link @click="cancelOrder(row)">取消订单</el-button>
            </div>

            <!-- 待收货：确认收货 + 取消 -->
            <div v-else-if="row.status === '待收货'">
              <el-button type="primary" size="small" @click="confirmReceipt(row)">确认收货</el-button>
              <el-button type="danger" size="small" link @click="cancelOrder(row)">取消订单</el-button>
            </div>

            <!-- 已完成：立即评价 -->
            <div v-else-if="row.status === '已完成'">
              <el-button type="warning" size="small" @click="goReview(row)">立即评价</el-button>
            </div>

            <!-- 其他状态：无操作 -->
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- <div class="order-total">
        <div class="total">合计：<strong>¥{{ totalPrice }}</strong></div>
      </div> -->
    </el-card>
  </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed } from 'vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const orderList = ref([])
const targetStatus = Number(route.params.id)
// console.log('当前 订单状态码:', targetStatus);
const statusMap = { 1: '待付款', 2: '待发货', 3: '待收货', 4: '已完成', 5: '已取消' }
/* 根据 user.id 拉取订单 */
const fetchOrders = async () => {
  try {
    const raw = localStorage.getItem('system-user')
    const user = raw ? JSON.parse(raw) : null
    console.log('当前 订单页user:', user);
    if (!user || !user.id) {
      ElMessage.warning('请先登录')
      return
    }
    // 示例：GET /api/orders?userId=xxx
    const { data } = await request.get(`/api/order/list1/${user.id}`)
    // orderList.value = data.data ?? []   // 按后端实际字段调整
    orderList.value = (Array.isArray(data) ? data : data.data ?? []).map(item => ({
      id: item.id,
      orderNumber: item.id, // 如果没有订单号，用 id 代替
      statusNumber: item.status,
      status: statusMap[item.status] ?? '未知状态',
      date: item.createTime.slice(0, 3).join('-'), // 取年月日
      img: `data:image/png;base64,${item.productImage}`, // base64 图片
      title: item.productName,
      price: item.price,
      num: item.quantity
    }))
      .filter(item => targetStatus != 0 ? item.statusNumber === targetStatus : true)
    console.log('当前 orderList.value:', orderList.value);
  } catch (e) {
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const totalPrice = computed(() =>
  orderList.value.reduce((sum, item) => sum + item.price * item.num, 0).toFixed(2)
)
/* 小工具：状态颜色 */
const statusColor = st => {
  const map = { 待付款: 'warning', 待发货: '', 待收货: 'info', 已完成: 'success', 已取消: 'danger' }
  return map[st] ?? 'info'
}

/* 取消订单 */
const cancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm('确认取消该订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    // 用户点了“取消”，什么都不做
    return
  }

  try {
    await request.post(`/api/order/cancel/${row.id}`)
    ElMessage.success('订单已取消')
    await fetchOrders()
  } catch (e) {
    ElMessage.error(e.msg || '取消失败')
  }
}
/* 支付订单（待付款） */
const payOrder = async (row) => {
  try {
    await request.post('/api/order/update', { id:row.id, status: 2 })
    ElMessage.success('支付成功')
    await fetchOrders()
  } catch (e) {
    ElMessage.error(e.msg || '支付失败')
  }
}

/* 确认收货（待收货） */
const confirmReceipt = async (row) => {
  try {
    await request.post('/api/order/update',{ id:row.id, status: 4})
    ElMessage.success('已确认收货')
    await fetchOrders()
  } catch (e) {
    ElMessage.error(e.msg || '确认收货失败')
  }
}

/* 立即评价（已完成） */
const goReview = (row) => {
  router.push(`/review/${row.id}`) // 跳评价页（路由自行配置）
}
onMounted(fetchOrders)
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.order-detail-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.order-card {
  margin-bottom: 20px;
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

.order-total {
  margin-top: 20px;
  text-align: right;
}

.total {
  font-size: 16px;
  color: #ff5000;
}

.total strong {
  font-size: 20px;
}
</style>