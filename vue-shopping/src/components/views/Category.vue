<template>
  <el-main class="search-main">
    <!-- 分类商品卡片 -->
    <el-card class="search-card">
      <template #header>
        <div class="search-header">
          <span>商品分类：{{ route.params.name || '全部' }}</span>
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>

      <!-- 空提示 -->
      <div v-if="!total" class="empty-tip">
        该分类下暂无商品，去看看其它分类吧~
      </div>

      <!-- 商品网格 -->
      <el-row v-else :gutter="20">
        <el-col v-for="p in list" :key="p.id" :xs="12" :sm="8" :md="6" :lg="6">
          <el-card shadow="hover" :body-style="{ padding: 0 }" @click="goDetail(p.id)">
            <img :src="p.image" class="goods-img" />
            <div class="goods-info">
              <div class="title">{{ p.title }}</div>
              <div class="subtitle">{{ p.subtitle || '热销好物，品质优选' }}</div>
              <div class="price-line">
                <span class="now">¥{{ p.price }}</span>
                <span class="sales">已售{{ p.sales || 0 }}</span>
              </div>
              <div class="shop">店铺：{{ p.shopName || '官方自营' }}</div>
              <div class="sku-tags">
                <el-tag v-for="(tag, idx) in (p.tags || []).slice(0, 2)" :key="idx" size="small" type="info">
                  {{ tag }}
                </el-tag>
                <span v-if="(p.tags || []).length > 2" class="more-sku">
                  +{{ p.tags.length - 2 }}
                </span>
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
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

/* 列表 & 分页状态 */
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const loading = ref(false)

/* 真正拉取后端数据 */
const loadData = async () => {
  const parentId = Number(route.params.id) || 0   // 0 代表“全部分类”
  if (parentId < 0) return

  loading.value = true
  try {
    const res = await request.post('/api/product/listByParentCategoryPage', {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      param: { parentCategoryId: parentId }
    })
    /* 接口直接返回 Page<ProductListDTO> */
    list.value = (res.content || res.data || []).map(item => ({
      ...item,
      image: item.productImg.startsWith('data:') ? item.productImg : `data:image/png;base64,${item.productImg}`
    }))
    total.value = res.totalElements || res.total || 0
    pageNum.value = res.number + 1 || res.current || 1
  } catch (e) {
    ElMessage.error('获取分类商品失败')
  } finally {
    loading.value = false
  }
}

/* 分页事件 */
const handleCurrentChange = val => { pageNum.value = val; loadData() }
const handleSizeChange = val => { pageNum.value = 1; pageSize.value = val; loadData() }

/* 路由变化 -> 重置到第一页 */
watch(() => route.params.id, () => {
  pageNum.value = 1
  loadData()
}, { immediate: true })

/* 返回 & 跳转详情 */
const goBack = () => router.back()
const goDetail = id => router.push(`/product/${id}`)

onMounted(loadData)
</script>

<style scoped>
/* 与搜索页保持 100% 一致 */
.search-main {
  min-height: 688px;
  background-color: #f5f5f5;
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.now {
  color: #ff5000;
  font-size: 16px;
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

.pagination {
  margin-top: 30px;
  justify-content: center;
  display: flex;
}
</style>