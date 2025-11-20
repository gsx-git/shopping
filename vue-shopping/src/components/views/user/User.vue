<template>
    <el-main class="user-main">
        <!-- 用户信息卡片 -->
        <el-card class="user-card">
            <div class="avatar-wrap">
                <img src="https://picsum.photos/100/100?random=888" class="avatar" />
                <div class="info">
                    <div class="name">超级买家</div>
                    <div class="phone">138****8888</div>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Star, View, Service } from '@element-plus/icons-vue'

const router = useRouter()

/* 订单入口 */
const orderTabs = [
    { label: '待付款', icon: 'el-icon-money', badge: 1 },
    { label: '待发货', icon: 'el-icon-truck', badge: 2 },
    { label: '待收货', icon: 'el-icon-box', badge: 0 },
    { label: '已完成', icon: 'el-icon-circle-check', badge: 0 }
]
const goOrder = idx => {
    if (idx === 0) {
        router.push('/user/orders') // 假设全部订单的路由是 /user/orders
    } else {
        router.push(`/user/order/${idx - 1}`)
    }
}

const goOrderDetail = idx => {
    const status = ['待付款', '待发货', '待收货', '已完成'][idx]
    router.push(`/user/order/${idx + 1}?status=${status}`)
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
    localStorage.removeItem('token')
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
</style>