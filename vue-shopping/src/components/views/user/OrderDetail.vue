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
      <el-table :data="orderDetail.items" row-key="id" show-overflow-tooltip>
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
        <div class="total">合计：<strong>¥{{ orderDetail.totalPrice }}</strong></div>
      </div>
    </el-card>
  </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const orderDetail = ref({
  orderNumber: '',
  status: '',
  date: '',
  items: [],
  totalPrice: 0
})

/* 获取订单详情 */
const fetchOrderDetail = () => {
  const orderId = route.params.id
  if (!orderId) {
    ElMessage.error('订单ID无效')
    return
  }
  // 模拟从后端获取订单详情
  orderDetail.value = {
    items: [
      {
        id: '1',
        orderNumber: `ORDER-${orderId}`,
        status: route.query.status || '全部订单',
        date: '2023-10-01',
        title: '商品1',
        price: 129.00,
        num: 1,
        img: 'https://picsum.photos/300/300?random=1'
      },
      {
        id: '2',
        orderNumber: `ORDER-${orderId}`,
        status: route.query.status || '全部订单',
        date: '2023-10-01',
        title: '商品2',
        price: 149.00,
        num: 2,
        img: 'https://picsum.photos/300/300?random=2'
      }
    ],
    totalPrice: 427.00
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchOrderDetail()
})
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