<template>
    <el-main class="sales-main">
        <!-- 1. 指标卡片 -->
        <el-row :gutter="20">
            <el-col :span="6" v-for="(c, index) in cards" :key="index">
                <el-card class="indicator-card" shadow="hover">
                    <div class="indicator-title">{{ c.title }}</div>
                    <div class="indicator-value">¥{{ c.value }}</div>
                    <div class="indicator-trend">
                        <span :class="c.trend > 0 ? 'up' : 'down'">
                            {{ c.trend > 0 ? '↑' : '↓' }} {{ Math.abs(c.trend) }}%
                        </span>
                        <span style="margin-left:8px;color:#999">同比昨日</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 2. 图表区 -->
        <el-row :gutter="20" style="margin-top:20px">
            <!-- 折线：近15日成交额 -->
            <el-col :span="16">
                <el-card shadow="hover">
                    <template #header><span>成交趋势（近15日）</span></template>
                    <div ref="lineRef" style="height:300px"></div>
                </el-card>
            </el-col>
            <!-- 饼图：商品销量占比 -->
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header><span>商品销量占比</span></template>
                    <div ref="pieRef" style="height:300px"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 3. Top10 商品 -->
        <el-card shadow="hover" style="margin-top:20px">
            <template #header><span>热销商品 Top10</span></template>
            <el-table :data="topProducts" stripe>
                <el-table-column type="index" width="50" />
                <el-table-column label="商品名称" prop="productName" show-overflow-tooltip />
                <el-table-column label="日销售额" width="120">
                    <template #default="{ row }">¥{{ row.dailyAmount }}</template>
                </el-table-column>
                <el-table-column label="总销售额" width="120">
                    <template #default="{ row }">¥{{ row.totalAmount }}</template>
                </el-table-column>
            </el-table>
        </el-card>
    </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
const shopId = Number(router.currentRoute.value.params.id) || 1   // ① 取店铺ID

const cards = ref([
    { title: '成交总额', value: 0, trend: 0 },
    { title: '订单数量', value: 0, trend: 0 },
    { title: '客单价', value: 0, trend: 0 },
    { title: '退单率', value: 0, trend: 0 }
])

const topProducts = ref([])

const lineRef = ref()
const pieRef = ref()
let lineChart, pieChart

/* 统一日期格式化 */
const fmtDate = arr => {
    if (!Array.isArray(arr) || arr.length < 3) return ''
    const [y, M, d] = arr.map(v => String(v).padStart(2, '0'))
    return `${y}-${M}-${d}`
}

/* 加载数据 */
const loadData = async () => {
    /* 1. 顶部指标 */
    const { data: total } = await request.get(`/api/statistics/shop/total?shopId=${shopId}`)
    cards.value[0].value = total || 0

    const { data: orderSum } = await request.get(`/api/order/listSumByshop/${shopId}`)
    const { unpaid, unship, unreceived, completed } = orderSum || {}
    const orderCount = [unpaid, unship, unreceived, completed].reduce((a, b) => (a || 0) + (b || 0), 0)
    cards.value[1].value = orderCount
    cards.value[2].value = orderCount ? (total / orderCount).toFixed(2) : 0
    cards.value[3].value = 0   // 退单率暂无字段，留0
    cards.value.forEach(c => c.trend = 0) // 趋势也留0

    /* 2. 近15日趋势 */
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
}

/* 折线图 */
const drawLine = arr => {
    const axis = arr.map(v => fmtDate(v.statDate))
    const series = arr.map(v => v.dailyAmount)
    lineChart = echarts.init(lineRef.value)
    lineChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 20, bottom: 30 },
        xAxis: { type: 'category', data: axis },
        yAxis: { type: 'value', name: '元' },
        series: [{
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
        }]
    })
}

/* 饼图 */
const drawPie = arr => {
    pieChart = echarts.init(pieRef.value)
    pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 10 },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 14 } },
            data: arr.map(v => ({ name: v.productName, value: v.dailyAmount }))
        }]
    })
}

onMounted(() => {
    loadData()
    window.addEventListener('resize', () => {
        lineChart?.resize()
        pieChart?.resize()
    })
})
</script>

<style scoped>
.sales-main {
    background: #f5f5f5;
    padding: 20px
}

.indicator-card {
    text-align: center
}

.indicator-title {
    font-size: 14px;
    color: #666
}

.indicator-value {
    font-size: 28px;
    font-weight: bold;
    margin: 8px 0
}

.indicator-trend {
    font-size: 13px
}

.indicator-trend .up {
    color: #f56c6c
}

.indicator-trend .down {
    color: #67c23a
}
</style>