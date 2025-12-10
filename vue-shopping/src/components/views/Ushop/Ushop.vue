<template>
    <el-main class="ushop-main">
        <!-- 1. 店铺信息卡片 -->
        <el-card class="shop-card">
            <div class="shop-card__inner">
                <div class="shop-card__left">
                    <img :src="shop.logo" class="shop-card__avatar" @error="handleAvatarError" />
                    <div class="shop-card__info">
                        <div class="shop-card__name">{{ shop.name || '超级卖家店铺' }}</div>
                        <div class="shop-card__phone">{{ shop.description || '店铺描述' }}</div>
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
                <el-menu-item v-for="m in menuList" :key="m.index" :index="m.index">
                    <el-icon>
                        <component :is="m.icon" />
                    </el-icon>
                    <span>{{ m.label }}</span>
                </el-menu-item>
            </el-menu>
        </el-card>
    </el-main>
</template>

<script setup>
/* ========== 引入 ========== */
import { onMounted, reactive, computed, ref, markRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    Money,        // 待付款
    Van,          // 待发货
    Goods,        // 待收货
    CircleCheck,  // 已完成
    Setting,
    TrendCharts,
    ChatDotRound,
    Discount,
    Upload,
    Download,
    WarningFilled,
    Star,
    RefreshLeft,
    RefreshRight
} from '@element-plus/icons-vue'
import axios from 'axios'
import request from '@/utils/request'


const router = useRouter()

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
    id: 0,
    name: '超级卖家店铺',
    phone: '138****7777',
    logo: '',
})
/* 查询当前用户的店铺信息 */
const loadShop = async () => {
    if (!user.value) return
    try {
        const res = await request.get(`/api/shop/list/${user.value.id}`)
        if (res.code === 200 && res.data?.length) {
            const shopInfo = res.data[0]
            shop.value.id = shopInfo.id
            shop.value.name = shopInfo.name
            shop.value.description = shopInfo.description
            shop.value.logo = shopInfo.logo
                ? `data:image/png;base64,${shopInfo.logo}`
                : 'https://picsum.photos/300/300?random=' + Date.now()
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

/* 商品管理 */
const productTabs = reactive([
    { label: '上架商品', icon: markRaw(Upload), badge: 0 },
    { label: '下架商品', icon: markRaw(Download), badge: 0 },
    { label: '库存预警', icon: markRaw(WarningFilled), badge: 0 },
    { label: '新品推荐', icon: markRaw(Star), badge: 0 }
])

/* 订单管理 */
const orderTabs = reactive([
    { label: '待付款', icon: markRaw(Money), badge: 0 },
    { label: '待发货', icon: markRaw(Van), badge: 0 },
    { label: '待收货', icon: markRaw(Goods), badge: 0 },
    { label: '已完成', icon: markRaw(CircleCheck), badge: 0 }
])

/* 功能菜单图标与跳转地址 */
const menuList = [
    { label: '店铺设置', index: 'settings', icon: markRaw(Setting) },
    { label: '销售统计', index: 'sales', icon: markRaw(TrendCharts) },
    { label: '评价管理', index: 'reviews', icon: markRaw(ChatDotRound) },
    { label: '促销活动', index: 'promotions', icon: markRaw(Discount) }
]

/* 订单状态映射 */
const badgeMap = ['unpaid', 'unship', 'unreceived', 'completed']

/* 3. 获取真实 badge 数字 */
const loadBadge = async () => {
    try {
        const res = await request.get(`/api/order/listSumByshop/${shop.value.id}`)

        // 400 或 data 为空时兜底成 0
        const stat = res.data || { unpaid: 0, unship: 0, unreceived: 0, completed: 0 }

        badgeMap.forEach((key, idx) => {
            orderTabs[idx].badge = Number(stat[key]) || 0
        })
    } catch (e) {
        ElMessage.error('订单数量加载失败')
    }
}

/* ========== 跳转函数 ========== */
const goProduct = idx => router.push(`/ushop/product/${idx}`)
const goOrder = idx => router.push(`/ushop/order/${idx}`)
const handleMenu = index => router.push(`/ushop/${index}`)
const goShopHome = () => ElMessage.success('跳转到店铺首页（待实现）')
// 监听 shop.id 变化，一旦有了就拉订单
watch(
    () => shop.value.id,
    (newId) => {
        if (newId) loadBadge()
    },
    { immediate: true } // 如果后端返回很快，也能立即触发
)
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