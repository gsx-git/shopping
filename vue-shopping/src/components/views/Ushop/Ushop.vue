<template>
    <el-main class="ushop-main">
        <!-- 1. 店铺信息卡片 -->
        <el-card class="shop-card">
            <div class="shop-card__inner">
                <div class="shop-card__left">
                    <img :src="avatarUrl" class="shop-card__avatar" @error="handleAvatarError" />
                    <div class="shop-card__info">
                        <div class="shop-card__name">{{ shop.name || '超级卖家店铺' }}</div>
                        <div class="shop-card__phone">{{ shop.phone || '138****7777' }}</div>
                    </div>
                </div>
                <div class="shop-card__actions">
                    <el-button type="primary" size="small" plain @click="goShopHome">
                        店铺首页
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 2. 商品管理快捷入口 -->
        <el-card class="section-card">
            <template #header>商品管理</template>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in productTabs" :key="idx">
                    <div class="order-cell" @click="goProduct(idx)">
                        <el-badge :value="t.badge" class="badge">
                            <!-- 用 el-icon 组件形式 -->
                            <el-icon :size="24">
                                <component :is="t.icon" />
                            </el-icon>
                        </el-badge>
                        <div class="label">{{ t.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 3. 订单管理快捷入口 -->
        <el-card class="section-card">
            <template #header>订单管理</template>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in orderTabs" :key="idx">
                    <div class="order-cell" @click="goOrder(idx)">
                        <el-badge :value="t.badge" class="badge">
                            <el-icon :size="24">
                                <component :is="t.icon" />
                            </el-icon>
                        </el-badge>
                        <div class="label">{{ t.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 4. 功能菜单 -->
        <el-card class="section-card">
            <el-menu :border="false" @select="handleMenu">
                <el-menu-item index="settings">
                    <el-icon>
                        <Setting />
                    </el-icon>
                    <span>店铺设置</span>
                </el-menu-item>
                <el-menu-item index="sales">
                    <el-icon>
                        <TrendCharts />
                    </el-icon>
                    <span>销售统计</span>
                </el-menu-item>
                <el-menu-item index="reviews">
                    <el-icon>
                        <ChatDotRound />
                    </el-icon>
                    <span>评价管理</span>
                </el-menu-item>
                <el-menu-item index="promotions">
                    <el-icon>
                        <Discount />
                    </el-icon>
                    <span>促销活动</span>
                </el-menu-item>
            </el-menu>
        </el-card>
    </el-main>
</template>

<script setup>
/* ========== 引入 ========== */
import { onMounted, reactive, computed, ref, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    Setting,
    TrendCharts,
    ChatDotRound,
    Discount,
    Upload,
    Download,
    WarningFilled,
    Star,
    Van,
    Goods,
    CircleCheck,
    RefreshLeft,
    RefreshRight
} from '@element-plus/icons-vue'
import axios from 'axios'
import request from '@/utils/request'

/* ========== 基础数据 ========== */
const router = useRouter()

// 后端返回字段
const badgeMap = ['unpaid', 'unship', 'unreceived', 'completed']

/* 读取当前登录用户（与 Layout 保持一致） */
const user = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('system-user') || '')
    } catch {
        return null
    }
})

/* 店铺信息（可向后端请求） */
const shop = ref({
    name: '超级卖家店铺',
    phone: '138****7777'
})
/* 查询当前用户的店铺信息 */
const loadShop = async () => {
  if (!user.value) return
  try {
    const res = await request.get(`/api/shop/list/${user.value.id}`)
    if (res.code === 200 && res.data?.length) {
      // 取第一家店铺（多数用户只有 1 家）
      const shopInfo = res.data[0]
      shop.value.name = shopInfo.name
      shop.value.phone = shopInfo.phone
      // 如有头像字段
      if (shopInfo.avatar) {
        avatarUrl.value = `${import.meta.env.VITE_BASE_URL}/api/shop/${shopInfo.id}/avatar`
      }
    } else {
      ElMessage.info(res.msg || '您还未开设店铺')
    }
  } catch (e) {
    ElMessage.error('店铺信息加载失败')
  }
}

/* 头像 */
const avatarUrl = ref(
    user.value
        ? `${import.meta.env.VITE_BASE_URL}/api/user/${user.value.id}/avatar`
        : 'https://picsum.photos/100/100?random=888'
)
const handleAvatarError = () => {
    avatarUrl.value = 'https://picsum.photos/100/100?random=888'
}

/* ========== 商品/订单 快捷入口 ========== */
const productTabs = reactive([
  { label: '上架商品', icon: markRaw(Upload),       badge: 5 },
  { label: '下架商品', icon: markRaw(Download),     badge: 3 },
  { label: '库存预警', icon: markRaw(WarningFilled), badge: 2 },
  { label: '新品推荐', icon: markRaw(Star),          badge: 0 }
])

const orderTabs = reactive([
  { label: '待发货',  icon: markRaw(Van),         badge: 2 },
  { label: '待收货',  icon: markRaw(Goods),       badge: 1 },
  { label: '已完成',  icon: markRaw(CircleCheck), badge: 0 },
  { label: '退款/售后', icon: markRaw(RefreshLeft), badge: 0 }
])

/* 功能菜单图标与跳转地址 */
const menuList = [
  { label: '店铺设置',  index: 'settings',   icon: markRaw(Setting) },
  { label: '销售统计',  index: 'sales',      icon: markRaw(TrendCharts) },
  { label: '评价管理',  index: 'reviews',    icon: markRaw(ChatDotRound) },
  { label: '促销活动',  index: 'promotions', icon: markRaw(Discount) }
]
/* ========== 跳转函数 ========== */
const goProduct = idx => router.push(`/ushop/product/${idx}`)
const goOrder = idx => router.push(`/ushop/order/${idx}`)
const handleMenu = index => router.push(`/ushop/${index}`)
const goShopHome = () => ElMessage.success('跳转到店铺首页（待实现）')

onMounted(() => {
  loadShop()   // ✅ 把店铺信息拉下来
})
</script>

<style scoped>
.ushop-main {
    background-color: #f5f5f5;
    padding: 20px;
}

.shop-card {
    margin-bottom: 20px
}

.shop-card__inner {
    display: flex;
    align-items: center;
    justify-content: space-between
}

.shop-card__left {
    display: flex;
    align-items: center;
    gap: 12px
}

.shop-card__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover
}

.shop-card__name {
    font-size: 18px;
    font-weight: bold;
}

.shop-card__phone {
    color: #999;
    font-size: 14px;
    margin-top: 4px;
}

.shop-card__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.section-card {
    margin-bottom: 20px;
}

.order-cell {
    text-align: center;
    cursor: pointer;
}

.order-cell:hover {
    color: #ff5000;
}

.label {
    margin-top: 6px;
    font-size: 13px;
}
</style>