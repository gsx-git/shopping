<template>
    <div class="homeContainer">
        <div class="carousel-margin">
            <div class="type-sidebar">
                <div v-for="(item, index) in types" :key="index" class="type-item"
                    @click="goPage('category/' + item.id + '/' + item.name)">
                    <span>{{ item.name }}</span>
                    <el-icon class="category-icon">
                        <ArrowRight />
                    </el-icon>
                </div>
            </div>
            <div class="carousel-container">
                <el-carousel height="400px" :interval="3000">
                    <el-carousel-item v-for="item in carousels" :key="item.id">
                        <img :src="item.image" class="carousel-img" @click="goPage('/product/' + item.productId)"
                            style="cursor: pointer" alt="轮播图" />
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>

        <!-- 新品上架部分 -->
        <div class="section-container">
            <div class="section-header">
                <div class="section-title">
                    <h1>新品上架</h1>
                </div>
                <div>
                    <el-link href="/front/goods" :underline="false">查看更多>></el-link>
                </div>
            </div>
            <div class="goods-list">
                <el-row :gutter="20">
                    <el-col :span="6" v-for="(item, index) in timeGoods" :key="index" class="goods-col">
                        <el-card :body-style="{ padding: '0px' }" class="card-item" @click="goGoodsDetail(item)">
                            <img :src="item.image" alt="商品图片" class="goods-img">
                            <div class="goods-info">
                                <div class="goods-name">
                                    {{ item.name }}
                                </div>
                                <div class="goods-descr">
                                    {{ item.descr }}
                                </div>
                                <div class="goods-footer">
                                    <div class="goods-price">
                                        ￥{{ item.price }}
                                    </div>
                                    <div class="goods-sales">
                                        累计热销：{{ item.sales }}
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- 热销商品部分 -->
        <div class="section-container">
            <div class="section-header">
                <div class="section-title">
                    <h1>热销商品</h1>
                </div>
                <div>
                    <el-link href="/front/goods" :underline="false">查看更多>></el-link>
                </div>
            </div>
            <div class="goods-list">
                <el-row :gutter="20">
                    <el-col :span="6" v-for="(item, index) in salesGoods" :key="index" class="goods-col">
                        <el-card :body-style="{ padding: '0px' }" class="card-item" @click="goGoodsDetail(item)">
                            <img :src="item.image" alt="商品图片" class="goods-img">
                            <div class="goods-info">
                                <div class="goods-name">
                                    {{ item.name }}
                                </div>
                                <div class="goods-descr">
                                    {{ item.descr }}
                                </div>
                                <div class="goods-footer">
                                    <div class="goods-price">
                                        ￥{{ item.price }}
                                    </div>
                                    <div class="goods-sales">
                                        累计热销：{{ item.sales }}
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const carousels = ref([])
const types = ref([])
const timeGoods = ref([])
const salesGoods = ref([])

// 生命周期钩子
onMounted(() => {
    loadType()
    loadCarousel()
    loadTimeGoods()
    loadSaleGoods()
})

// 方法定义
const loadCarousel = async () => {
    try {
        const res = await request.get('/api/carousel/listAll')
        carousels.value = (res.data || []).map(item => ({
            ...item,
            image: item.image.startsWith('data:') ? item.image : `data:image/png;base64,${item.image}`
        }))
    } catch (error) {
        console.error('加载轮播图失败:', error)
        ElMessage.error('加载轮播图失败')
    }
}

const loadType = async () => {
    try {
        const { data } = await request.get('/api/productCategory/listALL')
        console.log(data)
        const map = {}                        // id → node
        const tree = []
        data.forEach(n => { map[n.id] = { ...n, children: [] } })
        data.forEach(n => {
            if (n.parentId == null) {           // 根节点
                tree.push(map[n.id])
            } else {                            // 子节点
                map[n.parentId]?.children.push(map[n.id])
            }
        })
        console.log(tree)
        types.value = tree
        console.log(types.value)
    } catch (error) {
        console.error('加载分类失败:', error)
        ElMessage.error('加载分类失败')
    }
}

const loadTimeGoods = async () => {
    try {
        const res = await request.get('/api/product/latest-four')
        timeGoods.value = (res.data || []).map(item => ({
            ...item,
            image: item.productImg.startsWith('data:') ? item.productImg : `data:image/png;base64,${item.productImg}`
        }))
    } catch (error) {
        console.error('加载新品失败:', error)
        ElMessage.error('加载新品失败')
    }
}

const loadSaleGoods = async () => {
    try {
        const res = await request.get('/api/product/top-sales-four')
        salesGoods.value = (res.data || []).map(item => ({
            ...item,
            image: item.productImg.startsWith('data:') ? item.productImg : `data:image/png;base64,${item.productImg}`
        }))
    } catch (error) {
        console.error('加载热销商品失败:', error)
        ElMessage.error('加载热销商品失败')
    }
}

const goPage = (url) => { router.push(url) }

const goGoodsDetail = (item) => { router.push(`/product/${item.id}`) }
</script>

<style scoped>
.homeContainer {
    width: 70%;
    margin: 0 auto;
    min-height: 90vh;
}

.carousel-margin {
    margin: 10px 0;
    display: flex;
    gap: 20px;
}

.type-sidebar {
    flex: 2;
    background-color: #606266;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    height: 400px;
}

.carousel-container {
    flex: 8;
}

.carousel-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.type-item {
    padding: 0 30px;
    margin: 10px 0;
    height: 25px;
    line-height: 33px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.type-item:hover {
    background-color: #ff6700;
}

.section-container {
    margin-top: 30px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-title {
    border-left: 5px solid #ff6700;
    padding-left: 7px;
    color: #303133;
    font-size: 12px;
}

.section-title h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}

.goods-list {
    margin-top: 20px;
}

.goods-col {
    margin-top: 10px;
}

.card-item {
    transition: transform 0.3s ease;
    height: 100%;
}

.card-item:hover {
    cursor: pointer;
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.goods-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

.goods-info {
    padding: 10px;
}

.goods-name {
    margin-top: 3px;
    font-size: 13px;
    font-weight: 500;
    color: #303133;
    line-height: 1.4;
}

.goods-descr {
    margin-top: 5px;
    font-size: 11px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
}

.goods-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.goods-price {
    font-size: 20px;
    color: #FFA500;
    font-weight: 600;
}

.goods-sales {
    font-size: 11px;
    color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .homeContainer {
        width: 85%;
    }
}

@media (max-width: 768px) {
    .homeContainer {
        width: 95%;
    }

    .carousel-margin {
        flex-direction: column;
    }

    .type-sidebar,
    .carousel-container {
        flex: none;
        width: 100%;
    }

    .goods-col {
        span: 12;
    }

    .section-title h1 {
        font-size: 20px;
    }
}
</style>