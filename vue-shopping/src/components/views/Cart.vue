<template>
  <el-main class="cart-main">
    <!-- 空购物车 -->
    <div v-if="!cartList.length" class="empty-box">
      <!-- <img src="https://picsum.photos/200/200?random=999" class="empty-img" /> -->
      <div class="empty-tip">购物车是空的~</div>
      <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
    </div>

    <!-- 有商品 -->
    <div v-else>
      <el-card>
        <el-table :data="cartList" row-key="id" show-overflow-tooltip>
          <el-table-column label="商品" min-width="220">
            <template #default="{ row }" >
              <div class="goods-box" @click="goDetail(row.productId)">
                <img :src="row.img" class="goods-img" />
                <div class="goods-title">{{ row.title }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="规格" min-width="200">
            <template #default="{ row }">
              <el-select v-model="row.sku" size="small" placeholder="选择规格" @change="(val) => updateCart(row, val)">
                <el-option v-for="opt in skuMap[row.productId] || []" :key="opt.id" :label="fmtSpecs(opt.specs)"
                  :value="opt.id" :disabled="opt.stock <= 0">
                  <span>{{ fmtSpecs(opt.specs) }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column label="数量" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.num" :min="1" :max="99" size="small" @change="updateCart(row)" />
            </template>
          </el-table-column>
          <el-table-column label="小计" min-width="100">
            <template #default="{ row }">¥{{ (row.price * row.num).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="80">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="delItem(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部结算栏 -->
        <div class="footer-bar">
          <div class="total">合计：<strong>¥{{ totalPrice }}</strong></div>
          <el-button type="danger" size="large" @click="goCheckout">去结算</el-button>
        </div>
      </el-card>
    </div>
  </el-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()

/* 购物车列表 */
const cartList = ref([])
/* 每个商品对应的所有 SKU 下拉数据源 */
const skuMap = ref({})
/* 格式化规格文案 */
const fmtSpecs = (str) => {
  try {
    const obj = JSON.parse(str)
    return Object.values(obj).join(' · ')
  } catch { return str }
}
/* 当前用户 */
const user = (() => {
  const raw = localStorage.getItem('system-user')
  return raw ? JSON.parse(raw) : null
})()

const fetchSkuList = async (productId) => {
  if (skuMap.value[productId]) return // 已缓存
  try {
    const res = await request.get(`/api/product/list1/${productId}`)
    const skus = (res.data?.skus || res.skus || []).map(s => ({
      ...s,
      specs: s.specs || '{}'
    }))
    skuMap.value[productId] = skus
  } catch {
    ElMessage.error(`加载规格失败: ${productId}`)
  }
}
/* 拉取远程购物车 */
const loadCart = async () => {
  if (!user?.id) return
  try {
    const res = await request.get(`/api/shoppingcart/list/${user.id}`)
    const list = (res.data ?? []).map(item => ({
      id: item.id,
      productId: item.productId,
      title: item.productName,
      price: item.price,
      num: item.quantity,
      sku: item.skuId,
      img: item.image
        ? `data:image/png;base64,${item.image}`
        : `https://picsum.photos/80/80?random=${item.productId}`
    }))
    cartList.value = list

    /* 为每个商品预拉 SKU 下拉数据 */
    const pidSet = [...new Set(list.map(i => i.productId))]
    await Promise.all(pidSet.map(fetchSkuList))
  } catch (e) {
    ElMessage.error('获取购物车失败')
  }
}
/* 规格或数量改变时调用；newSkuId 可选 */
const updateCart = async (row, newSkuId = null) => {
  if (!user?.id) return
  const finalSkuId = newSkuId ?? row.sku
  try {
    await request.put('/api/shoppingcart/update', {
      id: row.id,
      quantity: row.num,
      sku: { id: finalSkuId }
    })
    ElMessage.success('已更新')
    /* ✅ 重新拉购物车（含最新单价、库存） */
    await loadCart()
  } catch (e) {
    ElMessage.error('更新失败')
    await loadCart() // 回滚
  }
}

/* 删除条目 */
const delItem = async (cartId) => {
  if (!user?.id) return
  try {
    await request.delete(`/api/shoppingcart/delete/${cartId}`)
    ElMessage.success('已删除')
    loadCart()          // 重新拉列表
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

/* 合计金额 */
const totalPrice = computed(() =>
  cartList.value.reduce((sum, v) => sum + v.price * v.num, 0).toFixed(2)
)

/* 去结算 */
const goCheckout = () => {
  if (!cartList.value.length) return
  router.push('/checkout')
}
const goDetail = (id) => router.push(`/product/${id}`)
/* 首次加载 */
onMounted(loadCart)
</script>

<style scoped>
.cart-main {
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.empty-box {
  text-align: center;
  padding: 80px 0;
}

.empty-img {
  width: 160px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.empty-tip {
  color: #999;
  margin-bottom: 20px;
  font-size: 14px;
}

.goods-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.goods-title {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 20px;
}

.total {
  font-size: 16px;
  color: #ff5000;
}

.total strong {
  font-size: 20px;
}
</style>