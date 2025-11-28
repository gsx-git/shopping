<template>
  <el-main class="product-detail-main">
    <!-- 商品信息卡片 -->
    <el-card class="product-card">
      <template #header>
        <div class="product-header">
          <span>商品信息</span>
          <!-- 返回按钮 -->
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="product-img-wrap">
            <img :src="product.img" class="product-img" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="product-info">
            <h2 class="product-title">{{ product.title }}</h2>
            <div class="product-price">
              ¥{{ product.price }}
              <span class="sales-tip">已售 {{ product.sales }} 件</span>
            </div>
            <div class="product-description">{{ product.description }}</div>
            <div class="product-actions">
              <el-button type="primary" @click="addCart">加入购物车</el-button>
              <el-button type="success" @click="toggleFavorite">
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 商品评价 -->
    <el-card class="review-card">
      <template #header>
        <div class="review-header">
          <span>商品评价</span>
        </div>
      </template>
      <div v-if="reviews.length === 0" class="no-reviews">
        暂无评价，购买后可以进行评价！
      </div>
      <el-row v-else :gutter="20">
        <el-col v-for="review in reviews" :key="review.id" :span="24">
          <div class="review-item">
            <div class="review-avatar">
              <img :src="review.avatar" class="avatar" />
            </div>
            <div class="review-content">
              <div class="review-user">{{ review.username }}</div>
              <div class="review-text">{{ review.text }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
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

const product = ref({})   // 详情
const reviews = ref([])   // 评价
const isFavorited = ref(false)

/* 当前用户 */
const currentUser = (() => {
  const raw = localStorage.getItem('system-user')
  return raw ? JSON.parse(raw) : null
})()
/* ① 商品详情 */
const fetchProduct = async () => {
  const id = route.params.id
  try {
    const { data } = await request.get(`/api/product/list1/${id}`)
    product.value = {
      id: data.productId,
      title: data.name,
      price: data.price,
      description: data.subtitle || data.description,
      sales: data.sales || 0,
      img: data.productImg
        ? `data:image/png;base64,${data.productImg}`
        : 'https://picsum.photos/300/300?random=' + id
    }
  } catch (e) {
    ElMessage.error('获取商品详情失败')
  }
}

/* ② 商品评价 */
const fetchReviews = async () => {
  const id = route.params.id
  try {
    const { data } = await request.get(`/api/product/${id}/reviews`)
    reviews.value = (Array.isArray(data) ? data : data.data ?? []).map(r => ({
      id: r.id,
      username: r.userName,
      avatar: r.avatar
        ? `data:image/png;base64,${r.avatar}`
        : 'https://picsum.photos/50/50?random=' + r.id,
      text: r.content
    }))
  } catch (e) {
    ElMessage.error('获取评价失败')
  }
}

/* ③ 收藏状态 */
const fetchFavoriteStatus = async () => {
  if (!currentUser?.id) return   // 未登录不查询
  const id = route.params.id
  try {
    const { data } = await request.get(
      `/api/collection/exists`,
      { params: { userId: currentUser.id, productId: id } }
    )
    isFavorited.value = Boolean(data)   // 后端返回 true/false
  } catch (e) { /* 静默失败 */ }
}

/* ④ 加入购物车 */
const addCart = async () => {
  if (!currentUser?.id) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    await request.post('/api/cart', {
      userId: currentUser.id,
      productId: product.value.id,
      quantity: 1
    })
    ElMessage.success(`“${product.value.title}” 已加入购物车`)
  } catch (e) {
    ElMessage.error('加入购物车失败')
  }
}

/* ⑤ 收藏 / 取消收藏 */
const toggleFavorite = async () => {
  if (!currentUser?.id) {
    ElMessage.warning('请先登录')
    return
  }
  const id = route.params.id
  try {
    if (isFavorited.value) {
      await request.delete(`/api/collection/${id}`, {
        params: { userId: currentUser.id }
      })
      ElMessage.info('已取消收藏')
    } else {
      await request.post('/api/collection', {
        userId: currentUser.id,
        productId: id
      })
      ElMessage.success('已收藏')
    }
    isFavorited.value = !isFavorited.value
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

/* 返回 */
const goBack = () => router.back()

onMounted(() => {
  fetchProduct()
  fetchReviews()
  fetchFavoriteStatus()
})
</script>

<style scoped>
.header-container {
  text-align: right;
  margin-bottom: 20px;
}

.product-detail-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.product-card {
  margin-bottom: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  color: #ff5000;
  font-size: 14px;
}

.product-img-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 300px;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
}

.product-price {
  font-size: 20px;
  color: #ff5000;
}

.product-description {
  font-size: 14px;
  color: #666;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.review-card {
  margin-bottom: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-reviews {
  text-align: center;
  padding: 20px 0;
  color: #999;
}

.review-item {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.review-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-content {
  flex: 1;
}

.review-user {
  font-size: 16px;
  font-weight: bold;
}

.review-text {
  font-size: 14px;
  color: #666;
}

.sales-tip {
  margin-left: 12px;
  font-size: 13px;
  color: #999;
  font-weight: normal;
}
</style>