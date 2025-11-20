<template>
  <el-main class="track-main">
    <!-- 浏览记录卡片 -->
    <el-card class="track-card">
      <template #header>
        <div class="track-header">
          <span>浏览记录</span>
          <!-- 返回按钮 -->
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>
      <el-table :data="trackList" row-key="id" show-overflow-tooltip>
        <el-table-column label="商品图片" width="120">
          <template #default="{ row }">
            <img :src="row.img" class="track-img" @click="goDetail(row.id)" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="200">
          <template #default="{ row }">
            <span @click="goDetail(row.id)">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="浏览时间" width="180">
          <template #default="{ row }">{{ row.viewedAt }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="addCart(row.id)">加入购物车</el-button>
            <el-button type="text" @click="removeTrack(row.id)">删除记录</el-button>
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

const route = useRoute()
const router = useRouter()

const trackList = ref([])

/* 获取浏览记录列表 */
const fetchTrackList = () => {
  // 模拟从后端获取浏览记录列表
  trackList.value = [
    {
      id: '1',
      title: '商品1',
      price: 129.00,
      img: 'https://picsum.photos/100/100?random=1',
      viewedAt: '2023-10-01 10:00:00'
    },
    {
      id: '2',
      title: '商品2',
      price: 149.00,
      img: 'https://picsum.photos/100/100?random=2',
      viewedAt: '2023-10-02 11:00:00'
    }
  ]
}

/* 加入购物车 */
const addCart = (id) => {
  ElMessage.success(`商品${id}已加入购物车`)
}

/* 删除浏览记录 */
const removeTrack = (id) => {
  const index = trackList.value.findIndex(item => item.id === id)
  if (index > -1) {
    trackList.value.splice(index, 1)
    ElMessage.success('浏览记录已删除')
  }
}

/* 跳转到商品详情页 */
const goDetail = (id) => {
  router.push(`/product/${id}`)
}

/* 返回上一页 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchTrackList()
})
</script>

<style scoped>
.track-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.back-button {
  color: #ff5000;
  font-size: 14px;
}

.track-card {
  margin-bottom: 20px;
}

.track-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.track-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
}

.track-img:hover {
  opacity: 0.8;
}
</style>