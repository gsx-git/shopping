<template>
    <el-main class="user-main">
        <!-- 用户信息卡片 -->
        <el-card class="user-card">
            <div class="avatar-wrap">
                <img :src="avatarUrl" class="avatar" @error="handleAvatarError" />
                <div class="info">
                    <div class="name">{{ user.username }}</div>
                    <div class="phone">{{ user.phone }}</div>
                </div>
            </div>
            <el-button type="primary" size="small" plain @click="doLogout">退出登录</el-button>
        </el-card>

        <!-- 订单快捷入口 -->
        <el-card class="section-card"><template #header>
                <div class="order-header">
                    <span>我的订单</span>
                    <el-button type="text" @click="goAllOrders" class="all-orders-button">
                        查看全部订单 <i class="el-icon-arrow-right"></i>
                    </el-button>
                </div>
            </template>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in orderTabs" :key="idx">
                    <div class="order-cell" @click="goOrderDetail(idx)">
                        <el-badge :value="t.badge" class="badge">
                            <i :class="t.icon" style="font-size: 24px;"></i>
                        </el-badge>
                        <div class="label">{{ t.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 功能列表 -->
        <el-card class="section-card">
            <el-menu :border="false" @select="handleMenu">
                <el-menu-item index="address">
                    <el-icon>
                        <Location />
                    </el-icon>
                    <span>收货地址</span>
                </el-menu-item>
                <el-menu-item index="collect">
                    <el-icon>
                        <Star />
                    </el-icon>
                    <span>我的收藏</span>
                </el-menu-item>
                <el-menu-item index="track">
                    <el-icon>
                        <View />
                    </el-icon>
                    <span>浏览记录</span>
                </el-menu-item>
                <el-menu-item index="service">
                    <el-icon>
                        <Service />
                    </el-icon>
                    <span>联系客服</span>
                </el-menu-item>
            </el-menu>
        </el-card>
    </el-main>
</template>

<script setup>
import { onMounted, reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Star, View, Service } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

const raw = localStorage.getItem('system-user')
const user = raw ? JSON.parse(raw) : null
console.log('当前 用户页user:', user);

/* 头像地址（可写） */
const avatarUrl = ref(
    user ? `${import.meta.env.VITE_BASE_URL}/api/user/${user.id}/avatar`
        : 'https://picsum.photos/100/100?random=888'
)

/* 图片 404 时 fallback */
const handleAvatarError = () => {
    avatarUrl.value = 'https://picsum.photos/100/100?random=888'
}

/* 1. 定义响应式数组，badge 默认 0，等待接口回填 */
const orderTabs = reactive([
    { label: '待付款', icon: 'el-icon-money', badge: 0 },
    { label: '待发货', icon: 'el-icon-truck', badge: 0 },
    { label: '待收货', icon: 'el-icon-box', badge: 0 },
    { label: '已完成', icon: 'el-icon-circle-check', badge: 0 }
])

/* 2. 映射后端字段 → 数组下标 */
const badgeMap = ['unpaid', 'unship', 'unreceived', 'completed']

/* 3. 获取真实 badge 数字 */
const loadBadge = async () => {
    try {
        const res = await request.get(`/api/order/list3/${user.id}`)

        // 400 或 data 为空时兜底成 0
        const stat = res.data || { unpaid: 0, unship: 0, unreceived: 0, completed: 0 }

        badgeMap.forEach((key, idx) => {
            orderTabs[idx].badge = Number(stat[key]) || 0
        })
        // console.log('当前 orderTabs:', orderTabs);
    } catch (e) {
        ElMessage.error('订单数量加载失败')
    }
}

onMounted(() => {
    loadBadge()
})
const goOrderDetail = idx => {
    // const status = ['待付款', '待发货', '待收货', '已完成'][idx]
    router.push(`/user/order/${idx + 1}`)
}

const goAllOrders = () => {
    router.push('/user/order/0')
}

/* 功能菜单 */
const handleMenu = index => {
    router.push(`/user/${index}`)
}

/* 退出登录 */
const doLogout = () => {
    localStorage.removeItem('system-user')
    ElMessage.success('已退出登录')
    router.replace('/')
}
</script>

<style scoped>
.user-main {
    background-color: #f5f5f5;
    min-height: calc(100vh - 60px);
    padding: 20px;
}

.user-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.avatar-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.name {
    font-size: 18px;
    font-weight: bold;
}

.phone {
    color: #999;
    font-size: 14px;
    margin-top: 4px;
}

.section-card {
    margin-bottom: 20px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.all-orders-button {
    color: #ff5000;
    font-size: 14px;
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

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.default-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    background: #f0f0f0;
}
</style>