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
        <!-- <el-table-column label="浏览时间" width="180">
          <template #default="{ row }">{{ row.viewedAt }}</template>
        </el-table-column> -->
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="addCart(row.id)">加入购物车</el-button>
            <el-button type="text" @click="removeTrack(row.historyId)">删除记录</el-button>
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

const trackList = ref([])

/* 获取真实浏览记录 */
const fetchTrackList = async () => {
  try {
    const raw = localStorage.getItem('system-user')
    const user = raw ? JSON.parse(raw) : null
    if (!user?.id) {
      ElMessage.warning('请先登录')
      router.replace('/')
      return
    }

    const { data } = await request.get(`/api/userHistory/list/${user.id}`)
    // 后端返回：Result.suc(List<TrackProductDTO>)
    trackList.value = (Array.isArray(data) ? data : data.data ?? []).map(item => ({
      id: item.productId,
      historyId: item.historyId,
      title: item.productName,
      price: item.productPrice,
      img: item.image
        ? `data:image/png;base64,${item.image}`
        : 'https://picsum.photos/100/100?random=1',
      viewedAt: item.viewedAt || '--'
    }))
  } catch (e) {
    ElMessage.error('获取浏览记录失败')
  }
}

/* 加入购物车 */
const addCart = (id) => {
  /* 调你现成的加购接口 */
  ElMessage.success(`商品${id} 已加入购物车`)
}

/* 删除浏览记录 */
const removeTrack = async (historyId) => {
  try {
    // 根据实际接口调整
    await request.delete(`/api/userHistory/delete/${historyId}`)
    ElMessage.success('浏览记录已删除')
    // 重新拉列表
    await fetchTrackList()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

/* 跳商品详情 */
const goDetail = (id) => router.push(`/product/${id}`)
const goBack = () => router.back()

onMounted(fetchTrackList)
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
  display: flex;  /* 垂直居中 */
  justify-content: space-between; /* 水平居右 */
  align-items: center;  /* 垂直居中 */
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