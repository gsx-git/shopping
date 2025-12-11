<template>
  <el-main class="search-main">
    <!-- 搜索商品卡片 -->
    <el-card class="search-card">
      <template #header>
        <div class="search-header">
          <span>“{{ route.query.q }}”相关商品</span>
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>

      <!-- 空提示 -->
      <div v-if="!total" class="empty-tip">
        没有找到“<strong>{{ route.query.q }}</strong>”相关商品，换个关键词试试吧~
      </div>

      <!-- 商品网格 -->
      <el-row v-else :gutter="20">
        <el-col v-for="p in list" :key="p.id" :xs="12" :sm="8" :md="6" :lg="6">
          <el-card shadow="hover" :body-style="{ padding: 0 }" @click="goDetail(p.id)">
            <img :src="`data:image/png;base64,${p.productImg}`" class="goods-img" />
            <div class="goods-info">
              <div class="title">{{ p.name }}</div>
              <div class="subtitle">{{ p.subtitle }}</div>
              <div class="price-line">
                <span class="now">¥{{ p.price }}</span>
                <span class="sales">已售{{ p.sales }}</span>
              </div>
              <div class="shop">店铺：{{ p.shopName }}</div>
              <div class="sku-tags">
                <el-tag v-for="s in p.skus.slice(0, 2)" :key="s.id" size="small" type="info">
                  {{ JSON.parse(s.specs)['功能'] || s.skuCode }}
                </el-tag>
                <span v-if="p.skus.length > 2" class="more-sku">+{{ p.skus.length - 2 }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
        :page-sizes="[20, 40, 80]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" class="pagination" />
    </el-card>
  </el-main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

/* 列表 & 分页状态 */
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

/* 请求数据 */
const loadData = async () => {
  const key = route.query.q || ''
  if (!key) return
  // const { data } = await request.post('/api/product/ListPage', {
  //   pageNum: pageNum.value,
  //   pageSize: pageSize.value,
  //   param: { name: key }
  // })

  // /* ✅ 关键：Spring 默认字段是 content / totalElements / number */
  // list.value = data.content          // 当前页数组
  // total.value = data.totalElements    // 总条数
  // pageNum.value = data.number + 1      // 后端从 0 开始，前端从 1 开始
  const res = await request.post('/api/product/ListPage', {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    param: { name: key }
  })

  // 本次修复：res 就是业务数据
  list.value = res.content
  total.value = res.totalElements
  pageNum.value = res.number + 1
}

/* 页码/每页条数变化 */
const handleCurrentChange = (val) => {
  pageNum.value = val
  loadData()
}
const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
  loadData()
}

/* 搜索关键字变化 -> 重置到第一页 */
watch(() => route.query.q, () => {
  pageNum.value = 1
  loadData()
}, { immediate: true })

/* 返回 & 跳转详情 */
const goBack = () => router.back()
const goDetail = (id) => router.push(`/product/${id}`)

</script>
<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.search-main {
  height: 688px;
  background-color: #f5f5f5;
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  /* ✅ 垂直居中 */
  justify-content: space-between;
  /* ✅ 水平居中 */
  align-items: center;
  /* ✅ 垂直居中 */
}

.back-button {
  color: #ff5000;
  font-size: 14px;
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
  cursor: pointer;
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

.pagination {
  margin-top: 30px;
  justify-content: center;
  display: flex;
}

.subtitle {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0;
}

.sales {
  font-size: 12px;
  color: #999;
}

.shop {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.sku-tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.more-sku {
  font-size: 12px;
  color: #999;
}
</style>