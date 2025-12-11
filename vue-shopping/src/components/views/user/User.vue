<template>
    <el-main class="user-main">
        <!-- 用户信息卡片 -->
        <el-card class="user-card">
            <div class="card-inner">
                <!-- 左侧头像信息 -->
                <div class="avatar-wrap">
                    <img :src="avatarUrl" class="avatar" @error="handleAvatarError" />
                    <div class="info">
                        <div class="name">{{ user.username || '超级用户' }}</div>
                        <div class="phone">{{ user.phone || "***我的电话***" }}</div>
                    </div>
                </div>

                <!-- 右侧按钮 -->
                <div class="btn-group">
                    <el-button type="primary" size="small" plain style="margin-left: 0 !important;"
                        @click="openEdit">修改资料</el-button>
                    <el-button type="primary" size="small" plain style="margin-left: 0 !important;"
                        @click="doLogout">退出登录</el-button>
                </div>
            </div>
        </el-card>

        <!-- 订单快捷入口 -->
        <el-card class="section-card">
            <template #header>
                <div class="order-header">
                    <span>我的订单</span>
                    <el-button type="text" @click="goAllOrders" class="all-orders-button">
                        查看全部订单
                    </el-button>
                </div>
            </template>
            <!-- 订单入口 -->
            <el-row :gutter="20">
                <el-col :span="6" v-for="(t, idx) in orderTabs" :key="'order-' + idx">
                    <div class="order-cell" @click="goOrderDetail(idx)">
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

        <!-- 功能列表 -->
        <el-card class="section-card">
            <el-menu :border="false" @select="handleMenu">
                <el-menu-item v-for="m in menuList" :key="'menu-' + m.index" :index="m.index">
                    <el-icon>
                        <component :is="m.icon" />
                    </el-icon>
                    <span>{{ m.label }}</span>
                </el-menu-item>
            </el-menu>
        </el-card>
    </el-main>

    <!-- 2. 复用注册弹窗，仅把标题动态化 -->
    <el-dialog v-model="editVisible" title="修改个人信息" width="420px" append-to-body>
        <el-form :model="editForm" :rules="editRules" ref="editRef" label-width="80px">
            <!-- 头像 -->
            <el-form-item label="头像" prop="avatar">
                <el-upload class="avatar-uploader" :show-file-list="false" :before-upload="beforeAvatar"
                    :http-request="dummyRequest" accept="image/jpeg,image/jpg,image/png">
                    <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="editForm.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email" />
            </el-form-item>

            <el-form-item label="新密码" prop="password">
                <el-input v-model="editForm.password" type="password" show-password placeholder="请输入 6 位以上新密码" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="editForm.confirmPassword" type="password" show-password />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="editVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmEdit">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { onMounted, reactive, computed, ref, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    Money,        // 待付款
    Van,          // 待发货
    Goods,        // 待收货
    CircleCheck,  // 已完成
    Location,     // 收货地址
    Star,         // 我的收藏
    View,         // 浏览记录
    Service,      // 联系客服
    Plus          // 头像上传 +
} from '@element-plus/icons-vue'
import axios from 'axios'
import request from '@/utils/request'

const router = useRouter()

const raw = localStorage.getItem('system-user')
const user = raw ? JSON.parse(raw) : null
console.log('当前 用户页user:', user);
/* 弹窗开关 */
const editVisible = ref(false)
/* 表单数据（与注册结构一致） */
const editForm = reactive({
    avatar: '',
    avatarFile: null,
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
})

/* 头像地址（可写） */
const avatarUrl = ref(
    user ? `${import.meta.env.VITE_BASE_URL}/api/user/${user.id}/avatar`
        : 'https://picsum.photos/100/100?random=888'
)

/* 图片 404 时 fallback */
const handleAvatarError = () => {
    avatarUrl.value = 'https://picsum.photos/100/100?random=888'
}

/* 订单入口图标 */
const orderTabs = reactive([
    { label: '待付款', icon: markRaw(Money), badge: 0 },
    { label: '待发货', icon: markRaw(Van), badge: 0 },
    { label: '待收货', icon: markRaw(Goods), badge: 0 },
    { label: '已完成', icon: markRaw(CircleCheck), badge: 0 }
])

/* 功能菜单图标 */
const menuList = [
    { label: '收货地址', index: 'address', icon: markRaw(Location) },
    { label: '我的收藏', index: 'collect', icon: markRaw(Star) },
    { label: '浏览记录', index: 'track', icon: markRaw(View) },
    { label: '联系客服', index: 'service', icon: markRaw(Service) }
]

/* 2. 映射后端字段 → 数组下标 */
const badgeMap = ['unpaid', 'unship', 'unreceived', 'completed']

/* 3. 获取真实 badge 数字 */
const loadBadge = async () => {
    try {
        const res = await request.get(`/api/order/list3/${user.id}`)

        // 400 或 data 为空时兜底成 0
        const stat = res.data || { unpaid: 0, unship: 0, unreceived: 0, completed: 0 }

        badgeMap.forEach((key, idx) => {
            orderTabs[idx].badge = Number(stat[key]) || 0
        })
        // console.log('当前 orderTabs:', orderTabs);
    } catch (e) {
        ElMessage.error('订单数量加载失败')
    }
}

/* 校验规则 */
const editRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
    ],
    /* 1. 必填  2. 最小长度 6  */
    password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '至少 6 位', trigger: 'blur' }
    ],
    confirmPassword: [
        {
            required: true,
            validator: (rule, val, cb) =>
                val === editForm.password ? cb() : cb(new Error('两次密码不一致')),
            trigger: 'blur'
        }
    ]
})

/* 打开弹窗时把当前用户信息回填 */
const openEdit = () => {
    editForm.avatar = avatarUrl.value // 现有头像
    editForm.username = user.username
    editForm.phone = user.phone
    editForm.email = user.email
    editForm.password = ''
    editForm.confirmPassword = ''
    editVisible.value = true
}

/* 确认修改 🚩 */
const editRef = ref()
/* 修改基本信息：纯 JSON */
const updateProfile = async () => {
    const payload = {
        username: editForm.username,
        phone: editForm.phone,
        email: editForm.email,
        password: editForm.password
    };
    request.post(`/api/user/update/${user.id}`, payload);
    ElMessage.success('资料已更新');
};

/* 修改头像：FormData */
const updateAvatar = async (rawFile = File) => {
    const fd = new FormData();
    fd.append('avatar', rawFile);
    const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/user/update/avatar/${user.id}`, fd);
    /* 成功后把新头像地址换掉 */
    avatarUrl.value = `${import.meta.env.VITE_BASE_URL}/api/user/${user.id}/avatar?t=` + Date.now();
};

/* 统一入口 */
const confirmEdit = async () => {
    const valid = await editRef.value.validate();
    if (!valid) return;

    /* 如果有新头像，先传 */
    if (editForm.avatarFile) await updateAvatar(editForm.avatarFile);
    /* 再传 JSON 数据 */
    await updateProfile();

    /* 刷新本地缓存 & 关闭弹窗 */
    Object.assign(user, editForm);
    localStorage.setItem('system-user', JSON.stringify(user));
    editVisible.value = false;
};
/* 复用注册里的 beforeAvatar & dummyRequest */
const beforeAvatar = file => {
    const isPic = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isPic) ElMessage.error('仅支持 jpg/png 格式')
    if (!isLt2M) ElMessage.error('头像大小不能超过 2MB')
    if (isPic && isLt2M) {
        editForm.avatar = URL.createObjectURL(file) // 本地预览
        editForm.avatarFile = file
    }
    return false // 手动上传
}
const dummyRequest = () => { } // el-upload 要求

const goOrderDetail = idx => {
    // const status = ['待付款', '待发货', '待收货', '已完成'][idx]
    router.push(`/user/orders/${idx + 1}`)
}

const goAllOrders = () => {
    router.push('/user/orders/0')
}

/* 功能菜单 */
const handleMenu = index => {
    router.push(`/user/${index}`)
}

/* 退出登录 */
const doLogout = () => {
    localStorage.removeItem('system-user')
    ElMessage.success('已退出登录')
    router.replace('/')
}

onMounted(() => {
    loadBadge()
})
</script>

<style scoped>
.user-main {
    background-color: #f5f5f5;
    padding: 20px;
}

.user-card {
    margin-bottom: 20px;
}

.card-inner {
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: space-between;
    /* 左右两端 */
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

.btn-group {
    display: flex;
    flex-direction: column;
    /* 上下排列 */
    gap: 8px;
    /* 按钮间距 */
}

.info-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
}

.section-card {
    margin-bottom: 20px;
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
    cursor: pointer;
}

.order-cell:hover {
    color: #ff5000;
}

.label {
    margin-top: 6px;
    font-size: 13px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.default-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    background: #f0f0f0;
}
</style>