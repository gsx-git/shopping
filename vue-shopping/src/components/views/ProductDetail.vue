<template>
  <el-main class="product-detail-main">
    <!-- 商品信息卡片 -->
    <el-card class="product-card">
      <template #header>
        <div class="product-header">
          <span>商品信息</span>
          <!-- 返回按钮 -->
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="product-img-wrap">
            <el-image :src="product.img" class="product-img" :preview-src-list="[product.img]"
              :preview-teleported="true" :z-index="9999" fit="contain">
            </el-image>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="product-info">
            <h2 class="product-title">{{ product.title }}</h2>
            <div class="product-price">
              ¥{{ product.price }}
              <span class="sales-tip">已售 {{ product.sales }} 件</span>
            </div>
            <div class="product-description">{{ product.description }}</div>
            <div class="product-actions">
              <el-button type="primary" @click="addCart">加入购物车</el-button>
              <el-button type="success" @click="toggleFavorite">
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
              <el-button type="warning" @click="openBuy"
                style="background-color: orange; border-color: orange;">购买</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- ① 商品评价卡片 -->
    <el-card class="review-card">
      <template #header>
        <div class="review-header">
          <span>商品评价</span>
          <el-button v-if="reviews.length > 3" type="text" style="color:#409EFF"
            @click="showMoreReviews = true">更多评论</el-button>
        </div>
      </template>

      <div v-if="reviews.length === 0" class="no-reviews">暂无评价，购买后可以进行评价！</div>

      <!-- 仅展示前 3 条 -->
      <div v-else class="review-list">
        <div v-for="review in (reviews.length > 3 ? reviews.slice(0, 3) : reviews)" :key="review.id" class="review-box">
          <img :src="review.avatar" class="review-avatar" />
          <div class="review-main">
            <div class="review-line">
              <span class="review-user">{{ review.username }}</span>
              <el-rate v-model="review.score" disabled show-score text-color="#ff9900" score-template="{value}" />
            </div>
            <div class="review-text">{{ review.text }}</div>
            <div class="review-time">{{ fmtDate(review.createTime) }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ② 更多评论弹窗 -->
    <el-dialog title="更多评论" v-model="showMoreReviews" width="520px" top="10vh">
      <div v-if="reviews.length === 0" class="no-reviews">暂无评价</div>
      <div v-else class="review-list">
        <div v-for="r in reviews" :key="r.id" class="review-box">
          <img :src="r.avatar" class="review-avatar" />
          <div class="review-main">
            <div class="review-line">
              <span class="review-user">{{ r.username }}</span>
              <el-rate v-model="r.score" disabled show-score text-color="#ff9900" score-template="{value}" />
            </div>
            <div class="review-text">{{ r.text }}</div>
            <div class="review-time">{{ fmtDate(r.createTime) }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 规格 & 数量选择弹框 -->
    <el-dialog v-model="showSku" title="选择规格" width="420px" :close-on-click-modal="false">
      <el-form label-width="70px">
        <el-form-item label="规格">
          <el-radio-group v-model="selectedSkuId">
            <el-radio v-for="s in skuList" :key="s.id" :label="s.id" :disabled="s.stock <= 0">
              {{ fmtSpecs(s.specs) }} &nbsp; <small>(库存 {{ s.stock }})</small>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="quantity" :min="1" :max="selectedSku?.stock || 1" size="small" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSku = false">取消</el-button>
        <el-button type="primary" @click="confirmAddCart">确定</el-button>
      </template>
    </el-dialog>

    <!-- 购买规格 & 数量选择 -->
    <el-dialog v-model="showBuy" title="选择规格" width="420px" :close-on-click-modal="false">
      <el-form label-width="70px">
        <el-form-item label="规格">
          <el-radio-group v-model="selectedSkuId">
            <el-radio v-for="s in skuList" :key="s.id" :label="s.id" :disabled="s.stock <= 0">
              {{ fmtSpecs(s.specs) }} &nbsp; <small>(库存 {{ s.stock }})</small>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="quantity" :min="1" :max="selectedSku?.stock || 1" size="small" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBuy = false">取消</el-button>
        <el-button type="primary" @click="confirmBuy">立即下单</el-button>
      </template>
    </el-dialog>
    <!-- ① 确认订单弹窗 -->
    <el-dialog v-model="showConfirm" title="确认订单" width="520px" :close-on-click-modal="false">
      <!-- 1. 收货地址 -->
      <el-form label-width="80px">
        <el-form-item label="收货地址">
          <el-select v-model="selectedAddrId" placeholder="请选择收货地址" style="width: 280px">
            <el-option v-for="a in addrList" :key="a.id" :label="`${a.receiver}  ${a.phone}  ${a.address}`"
              :value="a.id" />
          </el-select>
          <el-button type="text" style="margin-left: 12px" @click="goAddAddress">
            新增地址
          </el-button>
        </el-form-item>

        <!-- 2. 商品信息（只读） -->
        <el-form-item label="商品">
          <span>{{ product.title }}</span>
        </el-form-item>
        <el-form-item label="规格">
          <span>{{ fmtSpecs(selectedSku?.specs || '{}') }}</span>
        </el-form-item>
        <el-form-item label="数量">
          <span>{{ quantity }}</span>
        </el-form-item>

        <!-- 3. 金额 -->
        <el-form-item label="应付金额">
          <span style="color: #ff5000; font-size: 18px">¥{{ payAmount }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showConfirm = false">取消</el-button>
        <el-button type="primary" @click="createOrder">提交订单</el-button>
      </template>
    </el-dialog>
    <!-- 支付弹窗 -->
    <el-dialog v-model="showPay" title="支付订单" width="400px" :close-on-click-modal="false">
      <div style="text-align:center;font-size:18px;margin-bottom:20px;">
        应付金额：<strong style="color:#ff5000">¥{{ payAmount }}</strong>
      </div>
      <div style="text-align:center;">
        <el-button type="success" @click="doPay">支付</el-button>
        <el-button @click="cancelPay">取消</el-button>
      </div>
    </el-dialog>
  </el-main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
// 路由相关
const route = useRoute()
const router = useRouter()

// 商品数据相关
const product = ref({})     // 商品详情信息
const reviews = ref([])     // 商品评价列表
const skuList = ref([])     // 当前商品SKU列表
const selectedAddrId = ref(null)    // 选中的地址 ID

// 用户交互状态
const isFavorited = ref(false)  // 是否已收藏
const selectedSkuId = ref(null) // 当前选中的SKU ID
const quantity = ref(1)         // 选择的商品数量
const addrList = ref([])            // 当前用户的收货地址列表

// 弹窗显示控制
const showSku = ref(false)  // 加入购物车规格选择弹窗
const showBuy = ref(false)  // 立即购买规格选择弹窗
const showPay = ref(false)  // 支付弹窗
const showConfirm = ref(false)      // 控制确认订单弹窗

// 支付相关
const payAmount = ref(0)    // 待支付金额
let orderId = null          // 待支付订单号
let collectid = null        // 收藏项ID（用于取消收藏）

// 将 [yyyy,MM,dd,HH,mm] 格式化成 "YYYY-MM-DD HH:mm"
const fmtDate = arr => {
  if (!Array.isArray(arr) || arr.length < 5) return ''
  const [y, M, d, H, m] = arr.map(v => String(v).padStart(2, '0'))
  return `${y}-${M}-${d} ${H}:${m}`
}

/* 当前用户 */
const currentUser = (() => {
  const raw = localStorage.getItem('system-user')
  return raw ? JSON.parse(raw) : null
})()

/* ① 商品详情 */
const fetchProduct = async () => {
  const id = route.params.id
  try {
    const { data } = await request.get(`/api/product/list1/${id}`)

    /* 基本信息 */
    product.value = {
      id: data.id,
      title: data.name,
      shopId: data.shopId,
      price: data.price,
      description: data.subtitle || data.description,
      sales: data.sales || 0,
      img: data.productImg
        ? `data:image/png;base64,${data.productImg}`
        : `https://picsum.photos/300/300?random=${id}`
    }

    /* SKU列表（直接复用） */
    skuList.value = (data.skus || []).map(s => ({ ...s, specs: s.specs || '{}' }))
    selectedSkuId.value = skuList.value.find(v => v.stock > 0)?.id ?? null
  } catch {
    ElMessage.error('获取商品详情失败')
  }
}

/* ② 商品评价 */
const fetchReviews = async () => {
  const id = route.params.id
  try {
    const { data } = await request.get(`/api/productComment/list/${id}`)
    reviews.value = (Array.isArray(data) ? data : data.data ?? []).map(r => ({
      id: r.id,
      score: r.score || 5,
      username: r.username,
      avatar: r.userImage
        ? `data:image/png;base64,${r.userImage}`
        : 'https://picsum.photos/50/50?random=' + r.id,
      text: r.content,
      createTime: r.createTime || []
    }))
  } catch (e) {
    ElMessage.error('获取评价失败')
  }
}

/* ③ 收藏状态 - 拉列表比对 并保存当前商品收藏id*/
const fetchFavoriteStatus = async () => {
  if (!currentUser?.id) return

  try {
    const { data } = await request.get(`/api/collection/list/${currentUser.id}`)
    const list = Array.isArray(data) ? data : data.data ?? []

    // 当前商品 id
    const pid = Number(route.params.id)

    // 找到对应收藏项
    const hit = list.find(i => Number(i.productId || i.id) === pid)

    if (hit) {
      isFavorited.value = true
      // 后端返回的主键字段名如果是 collectId / collectionId / id 按需改
      collectid = hit.id
    } else {
      isFavorited.value = false
      collectid = null
    }
  } catch (e) {
    isFavorited.value = false
    collectid = null
  }
}

/* ⑤ 收藏 / 取消收藏 */
const toggleFavorite = async () => {
  if (!currentUser?.id) {
    ElMessage.warning('请先登录')
    return
  }
  const productid = product.value.id
  try {
    if (isFavorited.value) {
      await request.delete(`/api/collection/delete/${collectid}`)
      ElMessage.info('已取消收藏')
    } else {
      await request.post('/api/collection/add', {
        user: { id: currentUser.id },
        product: { id: productid }
      })
      ElMessage.success('已收藏')
    }
    isFavorited.value = !isFavorited.value
    /* ✅ 刷新收藏状态（整页不刷新） */
    await fetchFavoriteStatus()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

/* ⑥ 上传浏览记录 */
const addHistory = async () => {
  if (!currentUser?.id) return
  try {
    await request.post('/api/userHistory/add', {
      user: { id: currentUser.id },
      product: { id: route.params.id }
    })
  } catch (e) {
    console.warn('上传浏览记录失败', e)
  }
}

/* 格式化规格JSON */
const fmtSpecs = (str) => {
  try {
    const obj = JSON.parse(str)
    return Object.values(obj).join(' · ')
  } catch { return str }
}

/* 当前选中SKU对象 */
const selectedSku = computed(() =>
  skuList.value.find(s => s.id === selectedSkuId.value)
)

/* ④ 加入购物车--打开弹框 */
const addCart = () => {
  if (!currentUser?.id) {
    ElMessage.warning('请先登录')
    return
  }
  if (!skuList.value.length) {
    ElMessage.warning('该商品暂无规格可选')
    return
  }
  showSku.value = true
}
/* 「确认加入购物车」 */
const confirmAddCart = async () => {
  if (!selectedSkuId.value) {
    ElMessage.warning('请选择规格')
    return
  }
  try {
    await request.post('/api/shoppingcart/add', {
      user: { id: currentUser.id },
      product: { id: product.value.id },
      sku: { id: selectedSkuId.value },
      quantity: quantity.value
    })
    ElMessage.success('已加入购物车')
    showSku.value = false
  } catch {
    ElMessage.error('加入购物车失败')
  }
}


/* 拉取收货地址 */
const fetchAddress = async () => {
  if (!currentUser?.id) return
  try {
    const { data } = await request.get(`/api/useraddress/list/${currentUser.id}`)
    addrList.value = (Array.isArray(data) ? data : data.data ?? [])
      .map(item => ({
        id: item.id,
        receiver: item.receiver,
        phone: item.phone,
        address: `${item.province || ''}${item.city || ''}${item.detailAddress || ''}`.replace(/\s+/g, ''),
        isDefault: item.isDefault
      }))
      .sort((a, b) => b.isDefault - a.isDefault)   // 默认地址排最前
    // 默认选中默认地址
    const def = addrList.value.find(a => a.isDefault)
    selectedAddrId.value = def ? def.id : null
  } catch {
    ElMessage.error('获取收货地址失败')
  }
}
/* 打开规格选择弹窗（复用 skuList） */
const openBuy = () => {
  if (!currentUser?.id) {
    ElMessage.warning('请先登录')
    return
  }
  if (!skuList.value.length) {
    ElMessage.warning('该商品暂无规格可选')
    return
  }
  showBuy.value = true
}

/* 点击「立即下单」后不再直接出支付弹窗，而是出确认订单弹窗 */
const confirmBuy = async () => {
  if (!selectedSkuId.value) {
    ElMessage.warning('请选择规格')
    return
  }
  // 先拉地址，再弹窗
  await fetchAddress()
  // 计算金额
  payAmount.value = (selectedSku.value.price * quantity.value).toFixed(2)
  showBuy.value = false // 关闭规格选择弹窗
  showConfirm.value = true  // 弹窗确认订单弹窗
}

/* ===== 提交订单 ===== */
const createOrder = async () => {
  if (!selectedAddrId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  try {
    const { data } = await request.post('/api/order/add', {
      user: { id: currentUser.id },
      shop: { id: product.value.shopId },
      product: { id: product.value.id },
      sku: { id: selectedSkuId.value },
      price: selectedSku.value.price,
      quantity: quantity.value,
      userAddress: { id: selectedAddrId.value }   // 后端接收地址 ID
    })
    // 创建成功后拿到订单号
    orderId = data.orderId  // 后端返回的订单号
    ElMessage.success('订单提交成功，即将跳转支付...')
    showConfirm.value = false // 关闭确认订单弹窗
    showPay.value = true  // 显示支付弹窗
  } catch {
    ElMessage.error('提交订单失败')
  }
}

/* 支付：改为已支付并关闭弹窗 */
const doPay = async () => {
  try {
    await request.post('/api/order/update', { id: orderId, status: 2 })
    ElMessage.success('支付成功')
    showPay.value = false
    // 可跳转订单页
    router.push(`/product/${product.id}`)
  } catch {
    ElMessage.error('支付失败')
  }
}

/* 取消支付：订单仍为待支付，仅关闭弹窗 */
const cancelPay = () => {
  showPay.value = false
  // 订单状态保持“待支付”，可后续继续支付
}

/* 新增地址 */
const goAddAddress = () => {
  // 跳到地址管理页，带返回逻辑
  router.push('/user/address?back=product-' + product.value.id)
}

/* 弹窗开关 */
const showMoreReviews = ref(false)

/* 返回 */
const goBack = () => router.back()

onMounted(async () => {
  await fetchProduct()   // 先把 product.id 拿到
  addHistory()   // 上传浏览记录
  fetchReviews()         // 再用 product.id 拉评论
  fetchFavoriteStatus()
})
</script>

<style scoped>
.header-container {
  text-align: right;
  margin-bottom: 20px;
}

.product-detail-main {
  background-color: #f5f5f5;
  padding: 20px;
}

.product-card {
  margin-bottom: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  color: #ff5000;
  font-size: 14px;
}

.product-img-wrap {
  width: 600px;
  height: 450px;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* object-fit: cover; */
  cursor: pointer;
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

/* 统一列表容器 */
.review-list {
  padding: 0 8px;
}

/* 单条评价 */
.review-box {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-box:last-child {
  border: none;
}

/* 头像 */
.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%; 
  object-fit: cover;  
  margin-right: 12px;
  margin-top: 12px;
  flex-shrink: 0; 
}

/* 右侧内容区 */
.review-main {
  flex: 1;
}

/* 第一行：用户名 + 评分 */
.review-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.review-user {
  font-weight: bold;
  font-size: 14px;
}

/* 评论内容 */
.review-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

/* 时间 */
.review-time {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 6px;
}

/* 暂无提示 */
.no-reviews {
  text-align: center;
  padding: 30px 0;
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

.sales-tip {
  margin-left: 12px;
  font-size: 13px;
  color: #999;
  font-weight: normal;
}
</style>