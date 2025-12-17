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
                            <div class="goods-box" @click="goDetail(row.productId)">
                                <img :src="row.img" class="goods-img" />
                                <div class="goods-title">{{ row.title }}</div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="规格" min-width="200">
                        <template #default="{ row }">
                            <el-select v-model="row.sku" size="small" placeholder="选择规格"
                                @change="(val) => updateCart(row, val)">
                                <el-option v-for="opt in skuMap[row.productId] || []" :key="opt.id"
                                    :label="fmtSpecs(opt.specs)" :value="opt.id" :disabled="opt.stock <= 0">
                                    <span>{{ fmtSpecs(opt.specs) }}</span>
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="单价" width="100">
                        <template #default="{ row }">¥{{ row.price }}</template>
                    </el-table-column>
                    <el-table-column label="数量" width="160">
                        <template #default="{ row }">
                            <el-input-number v-model="row.quantity" :min="1" :max="99" size="small"
                                @change="updateCart(row)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="小计" min-width="100">
                        <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="80">
                        <template #default="{ row }">
                            <el-button link type="danger" size="small" @click="delItem(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 底部结算栏 -->
                <div class="footer-bar">
                    <div class="total">
                        合计：<strong>¥{{ totalPrice }}</strong>
                    </div>
                    <el-button type="danger" size="large" @click="goCheckout">去结算</el-button>
                </div>
            </el-card>
        </div>

        <!-- 结算确认弹窗 -->
        <el-dialog v-model="showCheckout" title="确认订单" width="480px">
            <el-form label-width="80px">
                <el-form-item label="收货地址">
                    <el-select v-model="selectedAddrId" placeholder="请选择收货地址" style="width: 280px">
                        <el-option v-for="a in addrList" :key="a.id" :label="`${a.receiver}  ${a.phone}  ${a.address}`"
                            :value="a.id" />
                    </el-select>
                    <el-button type="text" style="margin-left: 12px" @click="goAddAddress">
                        新增地址
                    </el-button>
                </el-form-item>
            </el-form>

            <el-table :data="checkoutList" size="small" :show-header="false">
                <el-table-column label="商品">
                    <template #default="{ row }">{{ row.title }}</template>
                </el-table-column>
                <el-table-column label="规格" width="120">
                    <template #default="{ row }">{{ fmtSpecs(row.specs) }}</template>
                </el-table-column>
                <el-table-column label="单价" width="80">
                    <template #default="{ row }">¥{{ row.price }}</template>
                </el-table-column>
                <el-table-column label="数量" width="80">
                    <template #default="{ row }">{{ row.num }}</template>
                </el-table-column>
                <el-table-column label="小计" width="100">
                    <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
                </el-table-column>
            </el-table>
            <div style="
          text-align: right;
          margin-top: 15px;
          font-size: 18px;
          color: #ff5000;
        ">
                合计：<strong>¥{{ totalPrice }}</strong>
            </div>
            <template #footer>
                <el-button @click="showCheckout = false">再想想</el-button>
                <el-button type="primary" @click="confirmCheckout">立即下单</el-button>
            </template>
        </el-dialog>

        <!-- 支付弹窗 -->
        <el-dialog v-model="showPay" title="支付订单" width="400px">
            <div style="text-align: center; font-size: 18px; margin-bottom: 20px">
                应付金额：<strong style="color: #ff5000">¥{{ payAmount }}</strong>
            </div>
            <div style="text-align: center">
                <el-button type="success" @click="doPay">支付</el-button>
                <el-button @click="cancelPay">取消</el-button>
            </div>
        </el-dialog>
    </el-main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import request from "@/utils/request";

const router = useRouter();
/* 结算相关状态 */
const showCheckout = ref(false);
const showPay = ref(false);
const payAmount = ref(0);
const checkoutList = ref([]);
let orderIds = []; // 本次生成的待支付订单号数组（后端返回）

const selectedAddrId = ref(null); // 选中的地址 ID
const addrList = ref([]); // 当前用户的收货地址列表

/* 购物车列表 */
const cartList = ref([]);
/* 每个商品对应的所有 SKU 下拉数据源 */
const skuMap = ref({});
/* 格式化规格文案 */
const fmtSpecs = (str) => {
    try {
        const obj = JSON.parse(str);
        return Object.values(obj).join(" · ");
    } catch {
        return str;
    }
};
/* 当前用户 */
const user = (() => {
    const raw = localStorage.getItem("system-user");
    return raw ? JSON.parse(raw) : null;
})();

/* 拉取远程 SKU */
const fetchSkuList = async (productId) => {
    if (skuMap.value[productId]) return; // 已缓存
    try {
        const res = await request.get(`/api/product/list1/${productId}`);
        const skus = (res.data?.skus || res.skus || []).map((s) => ({
            ...s,
            specs: s.specs || "{}",
        }));
        skuMap.value[productId] = skus;
    } catch {
        ElMessage.error(`加载规格失败: ${productId}`);
    }
};
/* 拉取远程购物车 */
const loadCart = async () => {
    if (!user?.id) return;
    try {
        const res = await request.get(`/api/shoppingcart/list/${user.id}`);
        const list = (res.data ?? []).map((item) => ({
            id: item.id,
            productId: item.productId,
            title: item.productName,
            shopId: item.shopId,
            price: item.price,
            quantity: item.quantity,
            sku: item.skuId,
            img: item.image
                ? `data:image/png;base64,${item.image}`
                : `https://picsum.photos/80/80?random=${item.productId}`,
        }));
        cartList.value = list;

        /* 为每个商品预拉 SKU 下拉数据 */
        const pidSet = [...new Set(list.map((i) => i.productId))];
        await Promise.all(pidSet.map(fetchSkuList));
    } catch (e) {
        ElMessage.error("获取购物车失败");
    }
};
/* 规格或数量改变时调用；newSkuId 可选 */
const updateCart = async (row, newSkuId = null) => {
    if (!user?.id) return;
    const finalSkuId = newSkuId ?? row.sku;
    try {
        await request.put("/api/shoppingcart/update", {
            id: row.id,
            quantity: row.quantity,
            sku: { id: finalSkuId },
        });
        /* ✅ 重新拉购物车（含最新单价、库存） */
        await loadCart();
    } catch (e) {
        ElMessage.error("更新失败");
        await loadCart(); // 回滚
    }
};

/* 删除条目 */
const delItem = async (cartId) => {
    if (!user?.id) return;
    try {
        await request.delete(`/api/shoppingcart/delete/${cartId}`);
        ElMessage.success("已删除");
        loadCart(); // 重新拉列表
    } catch (e) {
        ElMessage.error("删除失败");
    }
};

/* 拉取收货地址 */
const fetchAddress = async () => {
    if (!user?.id) return;
    try {
        const { data } = await request.get(`/api/useraddress/list/${user.id}`);
        addrList.value = (Array.isArray(data) ? data : data.data ?? [])
            .map((item) => ({
                id: item.id,
                receiver: item.receiver,
                phone: item.phone,
                address: `${item.province || ""}${item.city || ""}${item.detailAddress || ""
                    }`.replace(/\s+/g, ""),
                isDefault: item.isDefault,
            }))
            .sort((a, b) => b.isDefault - a.isDefault); // 默认地址排最前
        // 默认选中默认地址
        const def = addrList.value.find((a) => a.isDefault);
        selectedAddrId.value = def ? def.id : null;
    } catch {
        ElMessage.error("获取收货地址失败");
    }
};

/* 合计金额 */
const totalPrice = computed(() =>
    cartList.value.reduce((sum, v) => sum + v.price * v.quantity, 0).toFixed(2)
);

/* 去结算 */
/* 打开结算确认弹窗 */
const goCheckout = async () => {
    if (!cartList.value.length) return;
    checkoutList.value = cartList.value.map((item) => ({
        ...item,
        specs:
            (skuMap.value[item.productId] || []).find((s) => s.id === item.sku)
                ?.specs || "{}",
    }));
    // 先拉地址，再弹窗
    await fetchAddress();
    showCheckout.value = true;
};

/* 确认下单：批量生成订单 */
/* 确认下单：循环调用 /api/order/add */
const confirmCheckout = async () => {
    if (!user?.id) return;
    const items = cartList.value;
    orderIds.length = 0; // 清空
    let total = 0;
    if (!selectedAddrId.value) {
        ElMessage.warning("请选择收货地址");
        return;
    }
    try {
        for (const item of items) {
            // 逐条下单
            const { data } = await request.post("/api/order/add", {
                user: { id: user.id },
                shop: { id: item.shopId },
                product: { id: item.productId },
                sku: { id: item.sku },
                price: item.price,
                quantity: item.quantity,
                userAddress: { id: selectedAddrId.value }, // 后端接收地址 ID
            });
            orderIds.push(data.orderId); // 单条订单号
            total += item.price * item.quantity;
        }

        // 全部成功
        payAmount.value = total.toFixed(2); // 应付总金额
        showCheckout.value = false; // 关闭确认订单弹窗
        showPay.value = true; // 显示支付弹窗
    } catch (e) {
        ElMessage.error("下单失败，已停止继续提交");
        // 可选择把已生成的订单自动关闭（调取消接口）
        // if (orderIds.length) {
        //   await request.post('/api/order/batchCancel', { orderIds }).catch(() => { })
        // }
    }
};
/* 支付：批量改为已支付 */
const doPay = async () => {
    try {
        // 逐条改为已支付
        for (const oid of orderIds) {
            await request.post("/api/order/update", { id: oid, status: 2 });
        }
        ElMessage.success("支付成功");
        showPay.value = false;
        await loadCart();
        router.push("/cart"); // 建议跳到订单页
    } catch (e) {
        ElMessage.error(e.msg || "支付失败");
        console.error(e);
    }
};

/* 取消支付：仅关闭弹窗，订单保持待支付 */
const cancelPay = () => {
    showPay.value = false;
};
const goDetail = (id) => router.push(`/product/${id}`);
/* 首次加载 */
onMounted(loadCart);
</script>

<style scoped>
.cart-main {
    background: #f5f5f5;
    padding: 20px;
}

.empty-box {
    text-align: center;
    /* 居中 */
    padding: 80px 0;
    /* 上下内边距 */
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
    cursor: pointer;
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
    color: #409eff;
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