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
            <img :src="row.img" class="collect-img" @click="goDetail(row.id)" />
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

const route = useRoute()
const router = useRouter()

const collectList = ref([])

/* 获取收藏列表 */
const fetchCollectList = () => {
  // 模拟从后端获取收藏列表
  collectList.value = [
    {
      id: '1',
      title: '商品1',
      price: 129.00,
      img: 'https://picsum.photos/100/100?random=1'
    },
    {
      id: '2',
      title: '商品2',
      price: 149.00,
      img: 'https://picsum.photos/100/100?random=2'
    }
  ]
}

/* 加入购物车 */
const addCart = (id) => {
  ElMessage.success(`商品${id}已加入购物车`)
}

/* 取消收藏 */
const removeCollect = (id) => {
  const index = collectList.value.findIndex(item => item.id === id)
  if (index > -1) {
    collectList.value.splice(index, 1)
    ElMessage.success('已取消收藏')
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
  fetchCollectList()
})
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