<template>
  <el-main>
    <!-- 返回按钮容器 -->
    <div class="header-container">
      <el-button type="text" @click="goBack" class="back-button">
        返回 <i class="el-icon-arrow-left"></i>
      </el-button>
    </div>
    <div v-if="!list.length" class="empty-tip">
      没有找到“<strong>{{ route.query.q }}</strong>”相关商品，换个关键词试试吧~
    </div>
    <el-row v-else :gutter="20">
      <el-col v-for="p in list" :key="p.id" :span="6">
        <el-card shadow="hover" :body-style="{ padding: 0 }" @click="goDetail(p.id)">
          <img :src="p.img" class="goods-img" />
          <div class="goods-info">
            <div class="title">{{ p.title }}</div>
            <div class="price"><span class="now">¥{{ p.price }}</span></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const list = ref([])

const doSearch = (keyword = '') => {
  const key = keyword || route.query.q || ''
  if (!key) return
  list.value = Array.from({ length: 12 }, (_, i) => ({
    id: `r-${i}`,
    title: `${key} 相关商品-${i + 1}`,
    price: (99 + i * 20).toFixed(2),
    img: `https://picsum.photos/300/300?random=  ${Date.now() + i}`
  }))
}

const goBack = () => {
  router.back()
}

watch(() => route.query.q, doSearch, { immediate: true })

/* 跳转到商品详情页 */
const goDetail = (id) => {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.header-container {
  text-align: right;
  margin-bottom: 20px;
}
.return-button {
  text-align: right;
  margin-bottom: 20px;
}

.empty-tip {
  text-align: center;
  padding: 60px 0;
  color: #666;
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

.price {
  margin-bottom: 10px;
}

.now {
  color: #ff5000;
  font-size: 16px;
}

.back-button {
  margin-bottom: 20px;
  color: #ff5000;
  font-size: 14px;
}
</style>