<template>
  <el-main class="order-detail-main">
    <!-- 订单详情卡片 -->
    <el-card class="order-card">
      <template #header>
        <div class="order-header">
          <span>我的订单<span style="font-size: 12px;color: #ff5000;">（点击订单编号查看订单详情）</span></span>
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
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

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <!-- 已取消：无操作 -->
            <span v-if="row.status === '已取消'">--</span>

            <!-- 待付款：支付 + 取消 -->
            <div v-else-if="row.status === '待付款'">
              <el-button type="success" size="small" @click="payOrder(row)">支付</el-button>
              <el-button type="danger" size="small" @click="cancelOrder(row)">取消订单</el-button>
            </div>

            <!-- 待发货：取消订单 -->
            <div v-else-if="row.status === '待发货'">
              <el-button type="danger" size="small" @click="cancelOrder(row)">取消订单</el-button>
            </div>

            <!-- 待收货：确认收货 + 取消 -->
            <div v-else-if="row.status === '待收货'">
              <el-button type="primary" size="small" @click="confirmReceipt(row)">确认收货</el-button>
              <el-button type="danger" size="small" @click="cancelOrder(row)">取消订单</el-button>
            </div>

            <!-- 已完成：立即评价 -->
            <div v-else-if="row.status === '已完成'">
              <el-button type="warning" size="small" @click="openReview(row)">立即评价</el-button>
              <el-button type="info" size="small" @click="openMyComment(row)">查看评价</el-button>
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

    <!-- 评价弹窗（直接内嵌） -->
    <el-dialog title="发表评价" v-model="reviewVisible" width="420px" top="10vh" :close-on-click-modal="false"
      @closed="resetReview">
      <el-form :model="reviewForm" label-width="60px">
        <el-form-item label="评分">
          <el-rate v-model="reviewForm.score" show-text :texts="['1星', '2星', '3星', '4星', '5星']" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="reviewForm.content" type="textarea" :rows="4" maxlength="200" show-word-limit
            placeholder="请输入评价内容（200字以内）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reviewVisible = false">取 消</el-button>
        <el-button type="primary" :loading="reviewLoading" @click="submitReview">提 交</el-button>
      </template>
    </el-dialog>

    <!-- 查看/删除评价弹窗 -->
    <el-dialog title="我的评价" v-model="commentVisible" width="520px" top="10vh">
      <div v-if="myComments.length === 0" style="text-align:center;color:#999;">暂无评价</div>
      <div v-else>
        <div v-for="c in myComments" :key="c.id" class="comment-box">
          <div class="cmt-header">
            <el-rate v-model="c.score" disabled show-score score-template="{value}星" />
            <el-button type="text" size="small" style="color:#F56C6C" @click="deleteComment(c.id)">删除</el-button>
          </div>
          <div class="cmt-content">{{ c.content }}</div>
          <div class="cmt-time">{{ fmtDate(c.createTime) }}</div>
        </div>
      </div>
    </el-dialog>

  </el-main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const orderList = ref([])
const targetStatus = Number(route.params.id)

// 将 [yyyy,MM,dd,HH,mm] 格式化成 "YYYY-MM-DD HH:mm"
const fmtDate = arr => {
  if (!Array.isArray(arr) || arr.length < 5) return ''
  const [y, M, d, H, m] = arr.map(v => String(v).padStart(2, '0'))
  return `${y}-${M}-${d} ${H}:${m}`
}

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
      productId: item.productId,
      statusNumber: item.status,
      status: statusMap[item.status] ?? '未知状态',
      date: fmtDate(item.createTime), // 取年月日
      img: `data:image/png;base64,${item.productImage}`, // base64 图片
      title: item.productName,
      price: item.price,
      num: item.quantity
    }))
      .filter(item => targetStatus != 0 ? item.statusNumber === targetStatus : true)
    // console.log('当前 orderList.value:', orderList.value);
  } catch (e) {
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

/* ======== 评价相关 ======== */
const reviewVisible = ref(false)
const reviewLoading = ref(false)
const reviewForm = ref({
  orderId: '',
  productId: '',
  score: 5,
  content: ''
})

const openReview = row => {
  reviewForm.value.orderId = row.id
  reviewForm.value.productId = row.productId
  reviewVisible.value = true
}

const resetReview = () => {
  reviewForm.value = { orderId: '', productId: '', score: 5, content: '' }
}

const submitReview = async () => {
  if (!reviewForm.value.content.trim()) return ElMessage.warning('请输入评价内容')
  reviewLoading.value = true
  try {
    const raw = localStorage.getItem('system-user')
    const user = raw ? JSON.parse(raw) : null
    if (!user?.id) return ElMessage.warning('请先登录')
    await request.post('/api/productComment/add', {
      userId: user.id,
      productId: reviewForm.value.productId,
      score: reviewForm.value.score,
      content: reviewForm.value.content.trim()
    })
    ElMessage.success('评价成功')
    reviewVisible.value = false
    fetchOrders()          // 刷新列表
  } catch (e) {
    ElMessage.error(e?.msg || '提交失败')
  } finally {
    reviewLoading.value = false
  }
}

/* ====== 查看/删除评价 ====== */
const commentVisible = ref(false)
const myComments = ref([])   // 当前商品、当前用户的评价
let currentProductId = 0       // 临时缓存

/* 打开评价列表 */
const openMyComment = async row => {
  currentProductId = row.productId
  const raw = localStorage.getItem('system-user')
  const user = raw ? JSON.parse(raw) : null
  if (!user?.id) return ElMessage.warning('请先登录')
  try {
    // 一次性拉该商品的全部评价，前端再过滤当前用户
    const { data } = await request.get(`/api/productComment/list/${row.productId}`)
    myComments.value = (data || []).filter(c => c.userId === user.id)
    commentVisible.value = true
  } catch {
    ElMessage.error('获取评价失败')
  }
}

/* 删除评价 */
const deleteComment = async id => {
  try {
    await ElMessageBox.confirm('确定删除这条评价？', '提示', { type: 'warning' })
    await request.delete(`/api/productComment/delete/${id}`)
    ElMessage.success('已删除')
    // 重新拉当前列表
    myComments.value = myComments.value.filter(c => c.id !== id)
  } catch { }
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
    await request.post('/api/order/update', { id: row.id, status: 2 })
    ElMessage.success('支付成功')
    await fetchOrders()
  } catch (e) {
    ElMessage.error(e.msg || '支付失败')
  }
}

/* 确认收货（待收货） */
const confirmReceipt = async (row) => {
  try {
    await request.post('/api/order/update', { id: row.id, status: 4 })
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
const goOrderDetail = (row) => {
  router.push(`/user/orderdetail/${row.id}`)
}
const goProductDetail = (id) => router.push(`/product/${id}`)
</script>

<style scoped>
.order-detail-main {
  background-color: #f5f5f5;
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
  color: #409eff;
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

.comment-box {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.cmt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cmt-content {
  margin: 8px 0;
  font-size: 14px;
  color: #303133;
  white-space: pre-wrap;
}

.cmt-time {
  font-size: 12px;
  color: #909399;
}
</style>