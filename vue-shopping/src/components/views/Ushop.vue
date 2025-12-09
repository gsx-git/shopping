<template>
    <el-main class="ushop-main">
        <!-- 店铺信息卡片 -->
        <el-card class="shop-card">
            <div class="avatar-wrap">
                <img src="https://picsum.photos/100/100?random=777" class="avatar" />
                <div class="info">
                    <div class="name">超级卖家店铺</div>
                    <div class="phone">138****7777</div>
                </div>
            </div>
            <el-button type="primary" size="small" plain @click="goShopHome">店铺首页</el-button>
        </el-card>

        <!-- 商品管理快捷入口 -->
        <el-card class="section-card">
            <template #header>商品管理</template>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in productTabs" :key="idx">
                    <div class="order-cell" @click="goProduct(idx)">
                        <el-badge :value="t.badge" class="badge">
                            <i :class="t.icon" style="font-size: 24px;"></i>
                        </el-badge>
                        <div class="label">{{ t.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 订单管理快捷入口 -->
        <el-card class="section-card">
            <template #header>订单管理</template>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in orderTabs" :key="idx">
                    <div class="order-cell" @click="goOrder(idx)">
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, TrendCharts, ChatDotRound, Discount } from '@element-plus/icons-vue'

const router = useRouter()

/* 商品管理入口 */
const productTabs = [
    { label: '上架商品', icon: 'el-icon-upload', badge: 5 },
    { label: '下架商品', icon: 'el-icon-download', badge: 3 },
    { label: '库存预警', icon: 'el-icon-warning', badge: 2 },
    { label: '新品推荐', icon: 'el-icon-star-on', badge: 0 }
]
const goProduct = idx => {
    router.push(`/ushop/product/${idx}`)
}

/* 订单管理入口 */
const orderTabs = [
    { label: '待发货', icon: 'el-icon-truck', badge: 2 },
    { label: '待收货', icon: 'el-icon-box', badge: 1 },
    { label: '已完成', icon: 'el-icon-circle-check', badge: 0 },
    { label: '退款/售后', icon: 'el-icon-turn-off', badge: 0 }
]
const goOrder = idx => {
    router.push(`/ushop/order/${idx}`)
}

/* 功能菜单 */
const handleMenu = index => {
    router.push(`/ushop/${index}`)
}

/* 跳转店铺首页 */
const goShopHome = () => {
    ElMessage.success('跳转到店铺首页（待实现）')
}
</script>

<style scoped>
.ushop-main {
    height: 688px;
    background-color: #f5f5f5;
    padding: 20px;
}

.shop-card {
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
