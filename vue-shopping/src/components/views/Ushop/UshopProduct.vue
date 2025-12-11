<template>
    <el-main class="shop-product-main">
        <el-card class="product-card">
            <template #header>
                <div class="product-header">
                    <span>店铺商品<span style="font-size: 12px;color: #ff5000;">（点击商品名称查看商品详情）</span></span>
                    <el-button type="text" @click="goBack" class="back-button">
                        返回 <i class="el-icon-arrow-left"></i>
                    </el-button>
                </div>
            </template>

            <el-table :data="productList" row-key="id" v-loading="loading" show-overflow-tooltip>
                <!-- 商品图 -->
                <el-table-column label="商品图" width="100">
                    <template #default="{ row }">
                        <el-image style="width: 60px; height: 60px; border-radius: 4px; cursor: pointer;" :src="row.img"
                            :preview-src-list="[row.img]" fit="cover">
                            <template #error>
                                <img src="https://picsum.photos/60/60?random=888" class="goods-img" />
                            </template>
                        </el-image>
                    </template>
                </el-table-column>

                <!-- 商品名称 -->
                <el-table-column label="商品名称" min-width="200">
                    <template #default="{ row }">
                        <span style="color: #409eff; cursor: pointer;" @click="goProductDetail(row.id)">
                            {{ row.name }}
                        </span>
                    </template>
                </el-table-column>

                <!-- 售价 -->
                <el-table-column label="售价" width="100">
                    <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
                </el-table-column>

                <!-- 库存 -->
                <el-table-column label="库存" width="90" />

                <!-- 销量 -->
                <el-table-column label="销量" width="90" />

                <!-- 状态 -->
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'info'">
                            {{ row.status === 1 ? '上架' : '下架' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 操作 -->
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="goEdit(row.id)">编辑</el-button>
                        <el-button size="small" @click="toggleStatus(row)">
                            {{ row.status === 1 ? '下架' : '上架' }}
                        </el-button>
                        <el-popconfirm title="确定删除该商品吗？" @confirm="doDel(row.id)">
                            <template #reference>
                                <el-button size="small" type="danger">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination background layout="prev, pager, next, jumper, ->, total" :total="total" :page-size="pageSize"
                :current-page="pageNum" @current-change="handlePageChange" style="margin-top: 16px" />
        </el-card>
    </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import request from '@/utils/request'

const router = useRouter()

/* 基础数据 */
const loading = ref(false)
const productList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const shopId = ref(null)
const keyword = ref('')   // 搜索关键字

/* 获取当前用户店铺ID */
const getShopId = async () => {
    const raw = localStorage.getItem('system-user')
    if (!raw) return
    const user = JSON.parse(raw)
    const res = await request.get(`/api/shop/list/${user.id}`)
    if (res.code === 200 && res.data?.length) shopId.value = res.data[0].id
}

/* 加载商品分页数据 */
const loadData = async () => {
    if (!shopId.value) return
    loading.value = true
    try {
        const queryPageParam = {
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            name: keyword.value || undefined,
        }
        const res = await request.post(`/api/product/listByShop/${shopId.value}`, queryPageParam)
        console.log('axios 原始返回', res)

        /* 此时 res 就是业务对象本身 */
        productList.value = (res.content || []).map(item => ({
            id: item.id,
            name: item.name,
            subtitle: item.subtitle,
            price: item.price,
            stock: item.stock,
            sales: item.sales,
            status: item.status,
            img: item.productImg
                ? `data:image/png;base64,${item.productImg}`
                : `https://picsum.photos/60/60?random=${item.id}`
        }))
        total.value = res.totalElements || 0
        pageNum.value = (res.number || 0) + 1   // 0 起 → 1 起
    } catch (e) {
        console.error('加载商品异常', e)      // ← 关键
        ElMessage.error('加载商品失败：' + (e.message || e))
    } finally {
        loading.value = false
    }
}

/* 分页切换 */
const handlePageChange = val => {
    pageNum.value = val
    loadData()
}

/* 上下架切换 */
const toggleStatus = async row => {
    const newStatus = row.status === 1 ? 0 : 1
    try {
        await axios.put(`/api/product/status/${row.id}/${newStatus}`)
        ElMessage.success(newStatus === 1 ? '已上架' : '已下架')
        row.status = newStatus
    } catch {
        ElMessage.error('操作失败')
    }
}

/* 删除商品 */
const doDel = async id => {
    try {
        await axios.delete(`/api/product/${id}`)
        ElMessage.success('删除成功')
        loadData()
    } catch {
        ElMessage.error('删除失败')
    }
}

/* 跳转 */
const goBack = () => router.back()
const goProductDetail = id => router.push(`/product/${id}`)
const goEdit = id => router.push(`/ushop/product/edit/${id}`)

onMounted(async () => {
    await getShopId()
    if (shopId.value) loadData()
    else ElMessage.warning('您还未开设店铺')
})
</script>

<style scoped>
.shop-product-main {
    background-color: #f5f5f5;
    padding: 20px;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

.goods-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
}
</style>