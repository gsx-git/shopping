<template>
    <el-main class="sales-main">
        <!-- 1. 头部 -->
        <div class="product-header">
            <div class="shop-bar" @click="router.push(`/shop/detail/${shopId}`)">
                <img :src="shopLogo" class="shop-logo" />
                <span class="shop-name">{{ shopName }}</span>
            </div>
            <el-button type="text" @click="goBack" class="back-button">
                <el-icon>
                    <ArrowLeft />
                </el-icon> 返回
            </el-button>
        </div>

        <!-- 2. 指标卡片 -->
        <!-- <el-row :gutter="20">
            <el-col :span="6" v-for="(c, index) in cards" :key="index">
                <el-card class="indicator-card" shadow="hover">
                    <div class="indicator-title">{{ c.title }}</div>
                    <div class="indicator-value">¥{{ formatMoney(c.value) }}</div>
                    <div class="indicator-trend">
                        <span :class="c.trend > 0 ? 'up' : 'down'">
                            {{ c.trend > 0 ? '↑' : '↓' }} {{ Math.abs(c.trend) }}%
                        </span>
                        <span class="trend-tip">同比昨日</span>
                    </div>
                </el-card>
            </el-col>
        </el-row> -->

        <!-- 指标卡片 -->
        <el-row :gutter="20">
            <el-col :span="6" v-for="(c, index) in cards" :key="index">
                <el-card class="indicator-card" shadow="hover">
                    <div class="indicator-title">{{ c.title }}</div>
                    <!-- 只有成交总额和客单价前面带 ¥ -->
                    <div class="indicator-value">
                        <template v-if="c.title === '成交总额' || c.title === '客单价'">¥</template>
                        {{ c.value }}
                        <template v-if="c.title === '退单率'">%</template>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 3. 图表区 -->
        <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="16">
                <el-card shadow="hover">
                    <template #header>成交趋势（近15日）</template>
                    <div ref="lineRef" class="chart-box"></div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>商品销售额占比</template>
                    <div ref="pieRef" class="chart-box"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 4. Top10 商品 -->
        <el-card shadow="hover" style="margin-top: 20px">
            <template #header>热销商品 Top10</template>
            <el-table :data="topProducts" stripe>
                <el-table-column type="index" width="50" />
                <el-table-column label="商品名称" prop="productName" show-overflow-tooltip />
                <el-table-column label="日销售额" width="120">
                    <template #default="{ row }">¥{{ formatMoney(row.dailyAmount) }}</template>
                </el-table-column>
                <el-table-column label="总销售额" width="120">
                    <template #default="{ row }">¥{{ formatMoney(row.totalAmount) }}</template>
                </el-table-column>
            </el-table>
        </el-card>
    </el-main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
const shopId = Number(router.currentRoute.value.params.id) || 1

/* 头部数据 */
const shop = ref({})
const shopName = computed(() => shop.value.name || '官方店铺')
const shopLogo = computed(() =>
    shop.value.logo
        ? `data:image/png;base64,${shop.value.logo}`
        : `https://picsum.photos/60/60?random=${shopId}`
)
const goBack = () => router.back()

/* 指标卡片 */
const cards = ref([
    { title: '成交总额', value: 0, trend: 0 },
    { title: '完成订单总数', value: 0, trend: 0 },
    { title: '客单价', value: 0, trend: 0 },
    { title: '退单率', value: 0, trend: 0 }
])

/* Top10 表格 */
const topProducts = ref([])

/* 图表 DOM & 实例 */
const lineRef = ref()
const pieRef = ref()
let lineChart = null
let pieChart = null

/* 工具函数 */
const formatMoney = val => Number(val).toLocaleString()

const fmtDate = arr => {
    if (!Array.isArray(arr) || arr.length < 3) return ''
    const [y, M, d] = arr.map(v => String(v).padStart(2, '0'))
    return `${y}-${M}-${d}`
}

/* 请求数据 */
const fetchShop = async () => {
    try {
        const { data } = await request.get(`/api/shop/listByShopId/${shopId}`)
        if (data && Object.keys(data).length) shop.value = data
    } catch {
        ElMessage.error('获取店铺信息失败')
    }
}

const loadData = async () => {
    try {
        /* 1. 顶部指标 */
        const { data: total } = await request.get(`/api/statistics/shop/total?shopId=${shopId}`)
        cards.value[0].value = total || 0

        const { data: orderSum } = await request.get(`/api/order/listSumByshop/${shopId}`)
        const { unpaid = 0, unship = 0, unreceived = 0, completed = 0, cancelled = 0 } = orderSum || {}
        const orderCount = completed
        cards.value[1].value = orderCount
        cards.value[2].value = orderCount ? (total / orderCount).toFixed(2) : 0
        cards.value[3].value = cancelled ? (cancelled / (completed + cancelled) * 100).toFixed(2) : 0
        cards.value.forEach(c => (c.trend = 0))

        /* 2. 15 日趋势 */
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 14)
        const { data: trend } = await request.get(
            `/api/statistics/shop/daily?shopId=${shopId}&start=${start.toISOString().slice(0, 10)}&end=${end.toISOString().slice(0, 10)}`
        )
        drawLine(trend || [])

        /* 3. 商品占比 & Top10 */
        const { data: prod } = await request.get(
            `/api/statistics/product/daily?shopId=${shopId}&start=${start.toISOString().slice(0, 10)}&end=${end.toISOString().slice(0, 10)}`
        )
        topProducts.value = (prod || []).slice(0, 10)
        drawPie(prod || [])
    } catch {
        ElMessage.error('加载数据失败')
    }
}

/* 绘制图表 */
const drawLine = arr => {
    const axis = arr.map(v => fmtDate(v.statDate))
    const series = arr.map(v => v.dailyAmount)
    lineChart = echarts.init(lineRef.value)
    lineChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 20, bottom: 30 },
        xAxis: { type: 'category', data: axis },
        yAxis: { type: 'value', name: '元' },
        series: [
            {
                data: series,
                type: 'line',
                smooth: true,
                itemStyle: { color: '#ff5000' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(255,80,0,0.3)' },
                        { offset: 1, color: 'rgba(255,80,0,0.05)' }
                    ])
                }
            }
        ]
    })
    if (!series.length) lineChart.setOption({ graphic: noDataGraphic() })
}

const drawPie = arr => {
    pieChart = echarts.init(pieRef.value)
    pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 10 },
        series: [
            {
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 14 } },
                data: arr.map(v => ({ name: v.productName, value: v.dailyAmount }))
            }
        ]
    })
    if (!arr.length) pieChart.setOption({ graphic: noDataGraphic() })
}

/* 统一“暂无数据”提示 */
const noDataGraphic = () => ({
    type: 'text',
    left: 'center',
    top: 'middle',
    style: { text: '暂无数据', fontSize: 14, fill: '#999' }
})

/* 生命周期 */
onMounted(() => {
    fetchShop()
    loadData()
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    lineChart?.dispose()
    pieChart?.dispose()
})

const resizeChart = () => {
    lineChart?.resize()
    pieChart?.resize()
}
</script>

<style scoped>
/* 整体背景 */
.sales-main {
    background: #f5f5f5;
    padding: 20px;
}

/* 头部 */
.product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.shop-bar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
}

.shop-name {
    font-weight: bold;
}

.shop-logo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

/* 指标卡片 */
.indicator-card {
    text-align: center;
    border-radius: 8px;
}

.indicator-title {
    font-size: 14px;
    color: #666;
}

.indicator-value {
    font-size: 28px;
    font-weight: bold;
    margin: 8px 0;
}

.indicator-trend {
    font-size: 13px;
}

.indicator-trend .up {
    color: #f56c6c;
}

.indicator-trend .down {
    color: #67c23a;
}

.trend-tip {
    margin-left: 8px;
    color: #999;
}

/* 图表区域 */
.chart-box {
    height: 300px;
}
</style>