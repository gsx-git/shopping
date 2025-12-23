<template>
    <el-main class="ushop-main">
        <!-- 1. 店铺信息卡片 -->
        <el-card class="shop-card">
            <div class="shop-card__inner">
                <div class="shop-card__left">
                    <img :src="shop.logo" class="shop-card__avatar" @error="handleAvatarError" />
                    <div class="shop-card__info">
                        <div class="shop-card__name">{{ shop.name || '超级卖家店铺' }}</div>
                        <div class="shop-card__phone">{{ shop.description || '店铺描述' }}</div>
                    </div>
                </div>
                <div class="shop-card__actions">
                    <el-button type="primary" size="small" plain style="margin-left: 0 !important;" @click="openEdit">
                        修改资料
                    </el-button>
                    <!-- <el-button type="primary" size="small" plain style="margin-left: 0 !important;" @click="openView">
                        查看资料 </el-button> -->
                    <el-button type="primary" size="small" plain style="margin-left: 0 !important;"
                        @click="goShopDetail">
                        查看店铺
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 订单管理快捷入口 -->
        <el-card class="section-card">
            <template #header>
                <div class="order-header">
                    <span>订单管理</span>
                    <el-button type="text" @click="goAllOrders" class="all-orders-button">
                        查看全部订单
                    </el-button>
                </div>
            </template>
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in orderTabs" :key="idx">
                    <div class="order-cell" @click="goOrder(idx)">
                        <el-badge :value="t.badge" class="badge">
                            <el-icon :size="24">
                                <component :is="t.icon" />
                            </el-icon>
                        </el-badge>
                        <div class="label">{{ t.label }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 4. 功能菜单 -->
        <el-card class="section-card">
            <el-menu :border="false" @select="handleMenu">
                <el-menu-item v-for="m in menuList" :key="m.index" :index="m.index">
                    <el-icon>
                        <component :is="m.icon" />
                    </el-icon>
                    <span>{{ m.label }}</span>
                </el-menu-item>
            </el-menu>
        </el-card>

        <!-- 店铺资料弹窗（查看/编辑复用） -->
        <el-dialog v-model="shopEditVisible" :title="isView ? '店铺资料' : '编辑店铺资料'" width="480px" append-to-body>
            <el-form :model="shopForm" :rules="shopRules" ref="shopEditRef" label-width="100px" :disabled="isView">
                <!-- Logo -->
                <el-form-item label="店铺Logo">
                    <el-upload :show-file-list="false" accept="image/jpeg,image/jpg,image/png"
                        :before-upload="beforeLogo" :disabled="isView">
                        <img v-if="logoUrl" :src="logoUrl" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>

                <!-- 弹窗-营业执照 同理 -->
                <el-form-item label="营业执照">
                    <el-image style="width: 100px; height: 100px; cursor: pointer;" :src="licenseUrl"
                        :preview-src-list="[licenseUrl]" fit="cover">
                        <template #error>
                            <el-icon class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </template>
                    </el-image>
                    <el-upload :show-file-list="false" accept="image/jpeg,image/jpg,image/png"
                        :before-upload="beforeLicense">
                        <el-button size="small" type="primary" plain style="margin-left: 12px;">更换</el-button>
                    </el-upload>
                </el-form-item>

                <el-form-item label="店铺名称" prop="name">
                    <el-input v-model="shopForm.name" placeholder="2-20个字" />
                </el-form-item>
                <el-form-item label="店铺描述" prop="description">
                    <el-input v-model="shopForm.description" type="textarea" :rows="3" placeholder="简单介绍一下你的店铺" />
                </el-form-item>
                <el-form-item label="身份证号" prop="idcardNo">
                    <el-input v-model="shopForm.idcardNo" placeholder="店主身份证号" />
                </el-form-item>
            </el-form>

            <template #footer>
                <!-- 查看模式只显示【关闭】 -->
                <template v-if="isView">
                    <el-button @click="shopEditVisible = false">关闭</el-button>
                </template>
                <!-- 编辑模式显示【取消/保存】 -->
                <template v-else>
                    <el-button @click="shopEditVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmShopEdit">保存</el-button>
                </template>
            </template>
        </el-dialog>


    </el-main>
</template>

<script setup>
/* ========== 引入 ========== */
import { onMounted, reactive, computed, ref, markRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
    Money, Van, Goods, CircleCheck,
    Setting, TrendCharts, ChatDotRound, Discount,
    Upload, Download, WarningFilled, Star
} from '@element-plus/icons-vue'
import axios from 'axios'
import request from '@/utils/request'

const router = useRouter()

/* 当前用户 */
const user = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('system-user') || '')
    } catch {
        return null
    }
})

/* 店铺信息 */
const shop = ref({
    id: 0,
    name: '超级卖家店铺',
    phone: '138****7777',
    logo: ''
})
const loadShop = async () => {
    if (!user.value) return
    try {
        const res = await request.get(`/api/shop/list/${user.value.id}`)
        if (res.code === 200 && res.data?.length) {
            const info = res.data[0]
            shop.value.id = info.id
            shop.value.name = info.name
            shop.value.description = info.description
            shop.value.logo = info.logo
                ? `data:image/png;base64,${info.logo}`
                : `https://picsum.photos/300/300?random=${Date.now()}`
            shop.value.licenseUrl = info.licenseUrl
                ? `data:image/png;base64,${info.licenseUrl}`
                : ''
            shop.value.idcardNo = info.idcardNo || ''
        } else {
            ElMessage.info(res.msg || '您还未开设店铺')
        }
    } catch (e) {
        ElMessage.error('店铺信息加载失败')
    }
}

/* 头像 */
const avatarUrl = ref(
    user.value
        ? `${import.meta.env.VITE_BASE_URL}/api/user/${user.value.id}/avatar`
        : 'https://picsum.photos/100/100?random=888'
)
const handleAvatarError = () => {
    avatarUrl.value = 'https://picsum.photos/100/100?random=888'
}

/* 弹窗开关 */
const shopEditVisible = ref(false)

/* 表单数据 */
const shopForm = reactive({
    id: null,
    name: '',
    description: '',
    idcardNo: '',
    logo: null,
    licenseUrl: null
})

/* 预览地址 */
const logoUrl = ref('')
const licenseUrl = ref('')

/* 校验规则 */
const shopRules = {
    name: [
        { required: true, message: '请输入店铺名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度 2-20 个字符', trigger: 'blur' }
    ],
    description: [{ required: true, message: '请输入店铺描述', trigger: 'blur' }],
    idcardNo: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        {
            pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i,
            message: '身份证号格式错误', trigger: 'blur'
        }
    ]
}

/* ====== 弹窗模式 ====== */
const isView = ref(false)   // true=查看  false=编辑

/* ====== 打开弹窗 ====== */
const openView = () => {     // 查看资料
    isView.value = true
    fillForm()                 // 公共回填
}
const openEdit = () => {     // 修改资料
    isView.value = false
    fillForm()
}

/* ====== 公共回填 ====== */
const fillForm = () => {
    shopForm.id = shop.value.id
    shopForm.name = shop.value.name
    shopForm.description = shop.value.description
    shopForm.idcardNo = shop.value.idcardNo ?? ''
    logoUrl.value = shop.value.logo.startsWith('data:image')
        ? shop.value.logo
        : `${import.meta.env.VITE_BASE_URL}/api/shop/${shop.value.id}/logo?t=${Date.now()}`
    licenseUrl.value = shop.value.licenseUrl?.startsWith('data:image')
        ? shop.value.licenseUrl
        : `${import.meta.env.VITE_BASE_URL}/api/shop/${shop.value.id}/license?t=${Date.now()}`

    shopForm.logo = null
    shopForm.licenseUrl = null
    shopEditVisible.value = true
}

/* beforeUpload */
const beforeLogo = file => {
    const isPic = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isPic) return ElMessage.error('仅支持 jpg/png 格式'), false
    if (!isLt2M) return ElMessage.error('图片大小不能超过 2MB'), false
    logoUrl.value = URL.createObjectURL(file)
    shopForm.logo = file
    return false
}

/* beforeUpload */
const beforeLicense = file => {
    const isPic = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isPic) return ElMessage.error('仅支持 jpg/png 格式'), false
    if (!isLt2M) return ElMessage.error('图片大小不能超过 2MB'), false
    licenseUrl.value = URL.createObjectURL(file)
    shopForm.licenseUrl = file
    return false
}

/* 提交（适配后端 /api/shop/update） */
const shopEditRef = ref()

/* 确认修改 */
const confirmShopEdit = async () => {
    const valid = await shopEditRef.value.validate()
    if (!valid) return

    try {
        // 1. DTO JSON Blob
        const dto = {
            shopId: shopForm.id,   // 后端叫 shopId
            name: shopForm.name,
            description: shopForm.description,
            idcardNo: shopForm.idcardNo,
            status: null
        }
        const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })

        // 2. FormData 字段名严格对应后端 @RequestPart
        const fd = new FormData()
        fd.append('shopUpdateDTO', dtoBlob)          // 对应 @RequestPart("shopUpdateDTO")
        if (shopForm.logo) fd.append('logo', shopForm.logo)       // 对应 logo
        if (shopForm.licenseUrl) fd.append('licenseUrl', shopForm.licenseUrl) // 对应 licenseUrl

        // 3. 请求
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/shop/update`, fd)
        ElMessage.success('店铺资料已更新')
        await loadShop()
        shopEditVisible.value = false
    } catch (e) {
        ElMessage.error('更新失败')
    }
}

/* 商品管理 */
const productTabs = reactive([
    { label: '上架商品', icon: markRaw(Upload), badge: 0 },
    { label: '下架商品', icon: markRaw(Download), badge: 0 },
    { label: '库存预警', icon: markRaw(WarningFilled), badge: 0 },
    { label: '新品推荐', icon: markRaw(Star), badge: 0 }
])

/* 订单管理 */
const orderTabs = reactive([
    { label: '待付款', icon: markRaw(Money), badge: 0 },
    { label: '待发货', icon: markRaw(Van), badge: 0 },
    { label: '待收货', icon: markRaw(Goods), badge: 0 },
    { label: '已完成', icon: markRaw(CircleCheck), badge: 0 }
])

/* 功能菜单（等 shop.id 有了再生成） */
const menuList = computed(() => [
    { label: '商品管理', index: 'product', icon: markRaw(Setting) },
    { label: '销售统计', index: `sales/${shop.value.id}`, icon: markRaw(TrendCharts) },
])

/* 订单 badge */
const badgeMap = ['unpaid', 'unship', 'unreceived', 'completed']
const loadBadge = async () => {
    try {
        const res = await request.get(`/api/order/listSumByshop/${shop.value.id}`)
        const stat = res.data || { unpaid: 0, unship: 0, unreceived: 0, completed: 0 }
        badgeMap.forEach((key, idx) => {
            orderTabs[idx].badge = Number(stat[key]) || 0
        })
    } catch (e) {
        ElMessage.error('订单数量加载失败')
    }
}

/* 跳转 */
/* 查看店铺详情 */
const goShopDetail = () => router.push(`/shop/detail/${shop.value.id}`)
const goProduct = idx => router.push(`/shop/product/${idx}`)
const goOrder = idx => router.push(`/shop/orders/${idx + 1}`)
const goAllOrders = () => { router.push('/shop/orders/0') }
const handleMenu = index => router.push(`/shop/${index}`)

/* 监听 shop.id */
watch(() => shop.value.id, newId => newId && loadBadge(), { immediate: true })

onMounted(async () => await loadShop())
</script>

<style scoped>
.ushop-main {
    background-color: #f5f5f5;
    padding: 20px
}

.shop-card {
    margin-bottom: 20px
}

.shop-card__inner {
    display: flex;
    align-items: center;
    justify-content: space-between
}

.shop-card__left {
    display: flex;
    align-items: center;
    gap: 12px
}

.shop-card__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover
}

.shop-card__name {
    font-size: 18px;
    font-weight: bold
}

.shop-card__phone {
    color: #999;
    font-size: 14px;
    margin-top: 4px
}

.shop-card__actions {
    display: flex;
    flex-direction: column;
    gap: 8px
}

.section-card {
    margin-bottom: 20px
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
    cursor: pointer
}

.order-cell:hover {
    color: #ff5000
}

.label {
    margin-top: 6px;
    font-size: 13px
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}
</style>