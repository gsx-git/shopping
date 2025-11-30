<template>
  <el-main class="collect-main">
    <!-- 收藏列表卡片 -->
    <el-card class="collect-card">
      <template #header>
        <div class="collect-header">
          <span>我的收藏</span>
          <!-- 返回按钮 -->
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>
      <el-table :data="collectList" row-key="id" show-overflow-tooltip>
        <el-table-column label="商品图片" width="120">
          <template #default="{ row }">
            <img :src="row.img" class="collect-img" @click="goDetail(row.productId)" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="200">
          <template #default="{ row }">
            <span @click="goDetail(row.productId)">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="addCart(row.id)">加入购物车</el-button>
            <el-button type="text" @click="removeCollect(row.id)">取消收藏</el-button>
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

const collectList = ref([])

/* 获取真实收藏列表 */
const fetchCollectList = async () => {
  try {
    const raw = localStorage.getItem('system-user')
    const user = raw ? JSON.parse(raw) : null
    if (!user?.id) {
      ElMessage.warning('请先登录')
      router.replace('/')
      return
    }

    const { data } = await request.get(`/api/collection/list/${user.id}`)
    // 后端返回：Result.suc(List<CollectedProductDTO>)
    collectList.value = (Array.isArray(data) ? data : data.data ?? []).map(item => ({
      id: item.id,
      productId: item.productId,
      title: item.productName,
      price: item.price,
      img: item.image
        ? `data:image/png;base64,${item.image}`
        : 'https://picsum.photos/100/100?random=1'
    }))
  } catch (e) {
    ElMessage.error('获取收藏失败')
  }
}

/* 加入购物车 */
const addCart = (id) => {
  /* 这里调你现成的加购接口即可 */
  ElMessage.success(`商品${id} 已加入购物车`)
}

/* 取消收藏 */
const removeCollect = async (id) => {
  try {
    await request.delete(`/api/collection/delete/${id}`)
    ElMessage.success('已取消收藏')
    await fetchCollectList()
  } catch (e) {
    ElMessage.error('取消收藏失败')
  }
}

/* 跳商品详情 */
const goDetail = (id) => router.push(`/product/${id}`)
const goBack = () => router.back()

onMounted(fetchCollectList)
</script>

<style scoped>
.collect-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.back-button {
  color: #ff5000;
  font-size: 14px;
}

.collect-card {
  margin-bottom: 20px;
}

.collect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collect-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
}

.collect-img:hover {
  opacity: 0.8;
}
</style>