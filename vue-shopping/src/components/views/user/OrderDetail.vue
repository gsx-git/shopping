<template>
  <el-main class="order-detail-main">
    <!-- 订单详情卡片 -->
    <el-card class="order-card">
      <template #header>
        <div class="order-header">
          <span>订单详情</span>
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
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button type="text" @click="goBack">取消订单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="order-total">
        <div class="total">合计：<strong>¥{{ totalPrice }}</strong></div>
      </div>
    </el-card>
  </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const orderList = ref([])

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
    const { data } = await axios.get('/api/orders', { params: { userId: user.id } })
    orderList.value = data.data ?? []   // 按后端实际字段调整
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