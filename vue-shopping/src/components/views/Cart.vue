<template>
    <el-main class="cart-main">
        <!-- 空购物车 -->
        <div v-if="!cartList.length" class="empty-box">
            <!-- <img src="https://picsum.photos/200/200?random=999" class="empty-img" /> -->
            <div class="empty-tip">购物车是空的~</div>
            <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
        </div>

        <!-- 有商品 -->
        <div v-else>
            <el-card>
                <el-table :data="cartList" row-key="id" show-overflow-tooltip>
                    <el-table-column label="商品" min-width="220">
                        <template #default="{ row }">
                            <div class="goods-box">
                                <img :src="row.img" class="goods-img" />
                                <div class="goods-title">{{ row.title }}</div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="单价" width="100">
                        <template #default="{ row }">¥{{ row.price }}</template>
                    </el-table-column>
                    <el-table-column label="数量" width="160">
                        <template #default="{ row }">
                            <el-input-number v-model="row.num" :min="1" :max="99" size="small"
                                @change="updateCart(row)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="小计" width="100">
                        <template #default="{ row }">¥{{ (row.price * row.num).toFixed(2) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                        <template #default="{ row }">
                            <el-button link type="danger" size="small" @click="delItem(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 底部结算栏 -->
                <div class="footer-bar">
                    <div class="total">合计：<strong>¥{{ totalPrice }}</strong></div>
                    <el-button type="danger" size="large" @click="goCheckout">去结算</el-button>
                </div>
            </el-card>
        </div>
    </el-main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

/* 虚拟数据 */
const cartList = ref([
  {
    id: '1',
    title: '商品1',
    price: 129.00,
    num: 1,
    img: 'https://picsum.photos/300/300?random=1'
  },
  {
    id: '2',
    title: '商品2',
    price: 149.00,
    num: 2,
    img: 'https://picsum.photos/300/300?random=2'
  },
  {
    id: '3',
    title: '商品3',
    price: 169.00,
    num: 1,
    img: 'https://picsum.photos/300/300?random=3'
  }
])

/* 更新数量 */
const updateCart = (row) => {
    localStorage.setItem('cart', JSON.stringify(cartList.value))
}

/* 删除商品 */
const delItem = (id) => {
    const idx = cartList.value.findIndex((v) => v.id === id)
    if (idx > -1) {
        cartList.value.splice(idx, 1)
        localStorage.setItem('cart', JSON.stringify(cartList.value))
        ElMessage.success('已删除')
    }
}

/* 合计金额 */
const totalPrice = computed(() =>
    cartList.value.reduce((sum, v) => sum + v.price * v.num, 0).toFixed(2)
)

/* 去结算 */
const goCheckout = () => {
    ElMessage.success('跳转到结算页面（待实现）')
}
</script>

<style scoped>
.cart-main {
    background: #f5f5f5;
    min-height: calc(100vh - 60px);
    padding: 20px;
}

.empty-box {
    text-align: center;
    padding: 80px 0;
}

.empty-img {
    width: 160px;
    border-radius: 8px;
    margin-bottom: 16px;
}

.empty-tip {
    color: #999;
    margin-bottom: 20px;
    font-size: 14px;
}

.goods-box {
    display: flex;
    align-items: center;
    gap: 12px;
}

.goods-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.goods-title {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.footer-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 20px;
    gap: 20px;
}

.total {
    font-size: 16px;
    color: #ff5000;
}

.total strong {
    font-size: 20px;
}
</style>