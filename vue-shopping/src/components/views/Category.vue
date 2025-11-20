<template>
  <el-main>
    <div>
      <!-- 当前分类标题 -->
      <h2 class="cate-title">分类：{{ route.params.id || '全部' }}</h2>
      <!-- 返回按钮容器 -->
      <div class="header-container">
        <el-button type="text" @click="goBack" class="back-button">
          返回 <i class="el-icon-arrow-left"></i>
        </el-button>
      </div>
    </div>
    <!-- 商品网格 -->
    <el-row :gutter="20">
      <el-col v-for="p in goods" :key="p.id" :span="6">
        <el-card shadow="hover" :body-style="{ padding: 0 }" @click="goDetail(p.id)">
          <img :src="p.img" class="goods-img" />
          <div class="goods-info">
            <div class="title">{{ p.title }}</div>
            <div class="price">
              <span class="now">¥{{ p.price }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const goods = ref([])

/* 根据路由参数拉取商品（写死模拟） */
const loadGoods = (cateId = '') => {
  const id = cateId || route.params.id || 'all'
  goods.value = Array.from({ length: 16 }, (_, i) => ({
    id: `c-${id}-${i}`,
    title: `${id}商品-${i + 1}`,
    price: (129 + i * 15).toFixed(2),
    img: `https://picsum.photos/300/300?random=${Date.now() + i}`
  }))
}

/* 首次 + 路由变化时重新加载 */
onMounted(() => loadGoods())
watch(() => route.params.id, loadGoods)

const goDetail = (id) => {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.cate-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #ff5000;
}

.goods-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.goods-info {
  padding: 12px;
  text-align: center;
}

.title {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.now {
  color: #ff5000;
  font-size: 16px;
}
</style>