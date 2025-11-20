<template>
  <el-main class="product-detail-main">
    <!-- 返回按钮容器 -->
    <div class="header-container">
      <el-button type="text" @click="goBack" class="back-button">
        返回 <i class="el-icon-arrow-left"></i>
      </el-button>
    </div>

    <!-- 商品信息卡片 -->
    <el-card class="product-card">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="product-img-wrap">
            <img :src="product.img" class="product-img" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="product-info">
            <h2 class="product-title">{{ product.title }}</h2>
            <div class="product-price">¥{{ product.price }}</div>
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

const route = useRoute()
const router = useRouter()

const product = ref({
  id: '',
  title: '',
  price: 0,
  img: '',
  description: ''
})

const reviews = ref([])

const isFavorited = ref(false)

/* 获取商品详情 */
const fetchProduct = () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID无效')
    return
  }
  // 模拟从后端获取商品详情
  product.value = {
    id: productId,
    title: `商品${productId}`,
    price: (Math.random() * 100).toFixed(2),
    img: `https://picsum.photos/300/300?random=${productId}`,
    description: `这是商品${productId}的详细描述`
  }
}

/* 获取商品评价 */
const fetchReviews = () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('商品ID无效')
    return
  }
  // 模拟从后端获取商品评价
  reviews.value = Array.from({ length: 3 }, (_, i) => ({
    id: `${productId}-${i}`,
    username: `用户${i + 1}`,
    avatar: `https://picsum.photos/50/50?random=${i}`,
    text: `这是商品${productId}的评价${i + 1}`
  }))
}

/* 加入购物车 */
const addCart = () => {
  ElMessage.success(`“${product.value.title}” 已加入购物车`)
  ElMessage.info('购买后才能进行评价')
}

/* 切换收藏状态 */
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  if (isFavorited.value) {
    ElMessage.success('已收藏')
  } else {
    ElMessage.info('已取消收藏')
  }
}

/* 返回上一页 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchProduct()
  fetchReviews()
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

.back-button {
  margin-bottom: 20px;
  color: #ff5000;
  font-size: 14px;
}

.product-card {
  margin-bottom: 20px;
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
</style>