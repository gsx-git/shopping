<template>
    <el-main class="order-detail-main">
        <el-card>
            <template #header>
                <div class="header">
                    <span>订单详情</span>
                    <el-button type="text" @click="goBack" class="back-button">
                        返回 <i class="el-icon-arrow-left"></i>
                    </el-button>
                </div>
            </template>

            <!-- 骨架 -->
            <el-skeleton v-if="loading" :rows="6" animated />

            <!-- 内容 -->
            <div v-else>
                <!-- 商品图片 -->
                <!-- <div class="mt20">
                    <div class="sub-title">商品图片</div>
                    <img :src="order.img" alt="商品图" class="goods-img" />
                </div> -->
                <!-- 订单基本信息 -->
                <el-descriptions title="基本信息" :column="2">
                    <el-descriptions-item label="订单编号">{{ order.id }}</el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="statusColor(order.status)">{{ order.status }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="下单时间">{{ formatTime(order.createTime) }}</el-descriptions-item>
                    <el-descriptions-item label="支付时间">{{ formatTime(order.payTime) }}</el-descriptions-item>
                    <el-descriptions-item label="发货时间">{{ formatTime(order.deliverTime) }}</el-descriptions-item>
                    <el-descriptions-item label="收货时间">{{ formatTime(order.receiveTime) }}</el-descriptions-item>
                    <el-descriptions-item label="商品名称">{{ order.productName }}</el-descriptions-item>
                    <el-descriptions-item label="商品规格">{{ fmtSpecs(order.sku.specs) }}</el-descriptions-item>
                    <el-descriptions-item label="单价">¥{{ order.price }}</el-descriptions-item>
                    <el-descriptions-item label="数量">{{ order.quantity }}</el-descriptions-item>
                    <el-descriptions-item label="总金额">¥{{ order.totalAmount }}</el-descriptions-item>
                    <el-descriptions-item label="实付金额">
                        <strong style="color:#ff5000">¥{{ order.payAmount }}</strong>
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 收货地址 -->
                <el-descriptions title="收货地址" :column="1" class="mt20">
                    <el-descriptions-item label="收件人">{{ address.receiver }}</el-descriptions-item>
                    <el-descriptions-item label="手机号">{{ address.phone }}</el-descriptions-item>
                    <el-descriptions-item label="地址">
                        {{ address.province }}{{ address.city }}{{ address.detailAddress }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-card>
    </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
console.log(route)
const router = useRouter()
const loading = ref(true)
const order = ref({})
const address = ref({})

const statusMap = { 1: '待付款', 2: '待发货', 3: '待收货', 4: '已完成', 5: '已取消' }
const statusColor = st => ({ 待付款: 'warning', 待发货: 'primary', 待收货: 'info', 已完成: 'success', 已取消: 'danger' }[st])

const formatTime = arr => arr ? arr.slice(0, 3).join('-') + ' ' + arr.slice(3, 6).join(':') : '-'

const goBack = () => router.back()

const fetchDetail = async () => {
    const id = route.params.orderId
    if (!id) {
        ElMessage.error('缺少订单号')
        return
    }
    try {
        // 后端返回的就是单笔订单，无需再 list.find
        const { data } = await request.get(`/api/order/listDetails/${id}`)
        const dto = data.data ?? data          // 兼容 Result 包装
        order.value = {
            ...dto,
            img: `data:image/png;base64,${dto.productImage || ''}`,
            status: statusMap[dto.status] || '未知'
        }
        address.value = dto.address ?? {}
    } catch (e) {
        ElMessage.error('获取订单详情失败')
    } finally {
        loading.value = false
    }
}

/* 格式化规格JSON */
const fmtSpecs = (str) => {
    try {
        const obj = JSON.parse(str)
        return Object.values(obj).join(' · ')
    } catch { return str }
}

onMounted(fetchDetail)
</script>

<style scoped>
.order-detail-main {
    background-color: #f5f5f5;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

.mt20 {
    margin-top: 20px;
}

.sub-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
}

.goods-img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
}
</style>