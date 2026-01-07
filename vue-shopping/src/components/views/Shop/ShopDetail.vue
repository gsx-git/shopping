<template>
    <el-main class="shop-detail-main">
        <!-- 1. 店铺头部 -->
        <el-card class="shop-head-card">
            <div class="shop-header">
                <div class="shop-bar">
                    <img :src="shopLogo" class="shop-logo" />
                    <div>
                        <div class="shop-name">{{ shop.name }}</div>
                        <div class="shop-desc">{{ shop.description || '暂无描述' }}</div>
                    </div>
                </div>

                <el-button type="text" @click="goBack" class="back-button">
                    返回 <i class="el-icon-arrow-left"></i>
                </el-button>
            </div>
        </el-card>

        <!-- 2. 商品列表 -->
        <el-card class="product-card">
            <template #header>
                <span>全部商品</span>
            </template>

            <el-row :gutter="20">
                <el-col v-for="p in products" :key="p.id" :xs="12" :sm="8" :md="6" :lg="6">
                    <!-- 极简商品卡片 -->
                    <div class="product-box" @click="router.push(`/product/${p.id}`)">
                        <img :src="p.productImg
                            ? `data:image/png;base64,${p.productImg}`
                            : `https://picsum.photos/300/300?random=${p.id}`
                            " class="product-img" />
                        <div class="product-name">{{ p.name }}</div>
                        <div class="product-price">¥{{ p.price }}</div>
                    </div>
                </el-col>
            </el-row>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pageNum" :page-size="pageSize" :total="total"
                layout="prev, pager, next" @current-change="loadProducts" />
        </el-card>
    </el-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const shopId = Number(route.params.id)
const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)
const products = ref([])
const shop = ref({})

const shopLogo = computed(() =>
    shop.value.logo
        ? (shop.value.logo.startsWith('data:image')
            ? shop.value.logo
            : `data:image/png;base64,${shop.value.logo}`)
        : 'https://picsum.photos/300/300?random=' + shopId
)

const loadShop = async () => {
    try {
        const res = await request.get(`/api/shop/listByShopId/${shopId}`)
        // 修正：判断res.data是否存在（对象非空），而不是判断length
        if (res.data && Object.keys(res.data).length) {
            shop.value = res.data
        }
    } catch (error) {
        // 增加异常捕获，处理接口请求失败的情况
        console.error('加载店铺信息失败：', error)
    }
}

const loadProducts = async () => {
    const res = await request.post(`/api/product/listByShop/${shopId}`, {
        pageNum: pageNum.value,
        pageSize: pageSize.value
    })
    products.value = res.content || []
    total.value = res.totalElements || 0
}

/* 返回 */
const goBack = () => router.back()

onMounted(() => {
    loadShop()
    loadProducts()
})
</script>

<style scoped>
.shop-detail-main {
    background: #f5f5f5;
    padding: 20px
}

.shop-head-card {
    margin-bottom: 20px
}

.shop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px
}

.shop-bar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
}

.shop-logo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover
}

.shop-name {
    font-size: 20px;
    font-weight: bold
}

.shop-desc {
    font-size: 14px;
    color: #666;
    margin-top: 6px
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

.product-box {
    cursor: pointer;
    background: #fff;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .08);
    transition: transform .2s;
}

.product-box:hover {
    transform: translateY(-2px)
}

.product-img {
    width: 100%;
    height: 180px;
    object-fit: cover
}

.product-name {
    padding: 8px 6px;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis
}

.product-price {
    padding: 0 6px 8px;
    font-size: 16px;
    color: #ff5000;
    font-weight: bold
}
</style>