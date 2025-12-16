<template>
    <el-container direction="vertical" style="height:98vh;">
        <el-header class="nav-header">
            <!-- 左侧 Logo -->
            <div class="logo">🛒 超级商城</div>
            <!-- 新增：登录/注册 or 欢迎/退出 -->
            <div class="auth-bar">
                <template v-if="!userInfo">
                    <span class="auth-btn" @click="showLogin">登录</span>
                    <span style="margin:0 6px;">/</span>
                    <span class="auth-btn" @click="showRegister">注册</span>
                </template>

                <template v-else>
                    <span style="margin-right:12px;color:#ff5000;">
                        您好，{{ userInfo.username || userInfo.phone }}
                    </span>
                    <span class="auth-btn" @click="logout">退出</span>
                </template>
            </div>
            <!-- 搜索框 -->
            <div class="search-wrap">
                <el-input v-model="searchKey" placeholder="搜你喜欢" clearable size="large" style="width: 380px;"
                    @keyup.enter="handleSearch">
                    <template #append>
                        <el-button type="primary" :icon="Search" @click="handleSearch" />
                    </template>
                </el-input>
            </div>
            <el-menu mode="horizontal" :ellipsis="false" :router="false" background-color="#fff" text-color="#333"
                :default-active="activeIndex" active-text-color="#ff5000" class="right-menu">
                <el-menu-item index="1" @click="goHome">首页</el-menu-item>
                <el-menu-item index="2" @click="goCart">购物车</el-menu-item>
                <el-menu-item index="3" @click="goUser">我的</el-menu-item>
                <el-menu-item index="4" @click="goUshop">我的店铺</el-menu-item>
            </el-menu>
        </el-header>

        <el-main style="height:0; flex:1; overflow-y:auto;"><router-view /></el-main>
    </el-container>


    <!-- 登录弹窗 -->
    <el-dialog v-model="loginVisible" title="登录" width="400px" append-to-body>
        <el-form :model="loginForm" label-width="60px">
            <el-form-item label="手机号"><el-input v-model="loginForm.phone" /></el-form-item>
            <el-form-item label="密码"><el-input v-model="loginForm.password" type="password" /></el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="loginVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmLogin">登录</el-button>
        </template>
    </el-dialog>

    <!-- 用户注册弹窗 -->
    <el-dialog v-model="registerVisible" title="注册" width="420px" append-to-body>
        <el-form :model="registerForm" :rules="registerRules" ref="registerRef" label-width="80px">
            <!-- 1. 头像上传 -->
            <el-form-item label="头像" prop="avatar">
                <el-upload class="avatar-uploader" :show-file-list="false" :before-upload="beforeAvatar"
                    :http-request="dummyRequest" accept="image/jpeg,image/jpg,image/png">
                    <img v-if="registerForm.avatar" :src="registerForm.avatar" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="registerForm.username" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="registerForm.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="registerForm.email" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="registerForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" show-password />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="registerVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmRegister">注册</el-button>
        </template>
    </el-dialog>

    <!-- 店铺注册弹窗 -->
    <el-dialog v-model="shopRegisterVisible" title="开设店铺" width="480px" append-to-body>
        <el-form :model="shopForm" :rules="shopRules" ref="shopRegisterRef" label-width="100px">
            <!-- logo -->
            <el-form-item label="店铺Logo">
                <el-upload class="avatar-uploader" :show-file-list="false" accept="image/jpeg,image/jpg,image/png"
                    :before-upload="beforeLogo">
                    <img v-if="logoUrl" :src="logoUrl" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>

            <!-- 营业执照 -->
            <el-form-item label="营业执照">
                <el-upload class="avatar-uploader" :show-file-list="false" accept="image/jpeg,image/jpg,image/png"
                    :before-upload="beforeLicense">
                    <img v-if="licenseUrl" :src="licenseUrl" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
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
            <el-button @click="shopRegisterVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmShopRegister">提交</el-button>
        </template>
    </el-dialog>

</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from "@/utils/request";
import axios from 'axios';
/* ===== 登录状态 ===== */
// 统一从 localStorage 拿
const userInfo = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('system-user') || '')
    } catch {
        return null
    }
})

/* ---------- 搜索 ---------- */
const searchKey = ref('')

/* ---------- 路由 ---------- */
const route = useRoute()
const router = useRouter()

/* ---------- 用户注册 ---------- */
const registerVisible = ref(false)
const registerRef = ref()
const registerForm = reactive({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',        // 新增：头像预览地址
    avatarFile: null   // 新增：真正的 File 对象
})

/* 头像上传前校验 */
const beforeAvatar = (rawFile) => {
    const allow = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allow.includes(rawFile.type)) {
        ElMessage.error('头像只能是 JPG / PNG 格式')
        return false
    }
    if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('头像大小不能超过 2MB')
        return false
    }
    registerForm.avatarFile = rawFile
    registerForm.avatar = URL.createObjectURL(rawFile)
    return false
}

/* 上传占位函数 */
const dummyRequest = () => { }

/* 确认密码校验 */
const validateConfirm = (_, value, callback) => {
    if (value !== registerForm.password) callback(new Error('两次密码输入不一致'))
    else callback()
}

/* 验证规则 */
const registerRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度 6-20 位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validateConfirm, trigger: 'blur' }
    ]
})

/* ---------- 店铺注册 ---------- */
const shopForm = reactive({
    name: '',
    description: '',
    idcardNo: '',
    logoFile: null,      // 真正的 File
    licenseFile: null    // 真正的 File
})
const shopRules = reactive({
    name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
    description: [{ required: true, message: '请输入店铺描述', trigger: 'blur' }],
    idcardNo: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        {
            pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])\d{2}\d{3}[\dX]$/,
            message: '身份证号格式错误', trigger: 'blur'
        }
    ]
})
const shopRegisterVisible = ref(false)
const shopRegisterRef = ref()

const logoUrl = ref('')
const licenseUrl = ref('')

/* 店铺logo上传前校验 */
const beforeLogo = (rawFile) => {
    const allow = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allow.includes(rawFile.type)) {
        ElMessage.error('Logo 只能是 JPG / PNG 格式')
        return false
    }
    if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('Logo 大小不能超过 2MB')
        return false
    }
    shopForm.logoFile = rawFile
    logoUrl.value = URL.createObjectURL(rawFile)
    return false
}

/* 营业执照上传前校验 */
const beforeLicense = (rawFile) => {
    const allow = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allow.includes(rawFile.type)) {
        ElMessage.error('营业执照只能是 JPG / PNG 格式')
        return false
    }
    if (rawFile.size / 1024 / 1024 > 5) {
        ElMessage.error('营业执照大小不能超过 5MB')
        return false
    }
    shopForm.licenseFile = rawFile
    licenseUrl.value = URL.createObjectURL(rawFile)
    return false
}

/* ---------- 用户注册弹窗 ---------- */
const showRegister = () => {
    loginVisible.value = false
    registerVisible.value = true
}

/* 用户注册提交 */
const confirmRegister = async () => {
    const valid = await registerRef.value.validate();
    if (!valid) return;

    const fd = new FormData();
    if (registerForm.avatarFile) fd.append('avatar', registerForm.avatarFile);

    const { avatar, avatarFile, ...raw } = registerForm;
    fd.append('user', new Blob([JSON.stringify(raw)], { type: 'application/json' }));

    /* ❶ 用原生 axios ❷ 不手动写 Content-Type */
    axios.post(`${import.meta.env.VITE_BASE_URL}/api/user/register`, fd)
        .then(res => {
            if (res.data.code === 200) {
                ElMessage.success('注册成功');
                registerVisible.value = false;
                loginVisible.value = true;
            } else {
                ElMessage.error(res.data.msg || '注册失败');
            }
        })
        .catch(() => ElMessage.error('网络异常'));
};

/* ---------- 店铺注册 ---------- */
const confirmShopRegister = async () => {
    await shopRegisterRef.value.validate()
    if (!shopForm.logoFile) return ElMessage.warning('请上传 Logo')
    if (!shopForm.licenseFile) return ElMessage.warning('请上传营业执照')

    const fd = new FormData()
    fd.append('logo', shopForm.logoFile)
    fd.append('licenseUrl', shopForm.licenseFile)

    const dto = {
        userId: userInfo.value.id,
        name: shopForm.name,
        description: shopForm.description,
        idcardNo: shopForm.idcardNo
    }
    fd.append('shopCreateDTO', new Blob([JSON.stringify(dto)], { type: 'application/json' }))

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/shop/add`,
            fd
        )
        if (res.data.code === 200) {
            ElMessage.success('店铺创建成功，等待审核')
            shopRegisterVisible.value = false
            router.push('/ushop')   // 直接进店铺后台
        } else {
            ElMessage.error(res.data.msg || '创建失败')
        }
    } catch {
        ElMessage.error('网络异常')
    }
}

/* ---------- 登录 ---------- */
const loginVisible = ref(false)
const loginForm = reactive({ phone: '', password: '' })
const confirmLogin = () => {
    if (!loginForm.phone || !loginForm.password) {
        ElMessage.warning('请填写完整')
        return
    }
    request.post('/api/user/login', loginForm)
        .then(res => {
            if (res.code === 200) {
                ElMessage.success('登录成功')
                loginVisible.value = false
                localStorage.setItem('system-user', JSON.stringify(res.data))
                location.reload()
                router.push('/')
            } else {
                ElMessage.error(res.msg || '登录失败')
            }
        })
        .catch(() => ElMessage.error('网络异常'))
}
const showLogin = () => {
    registerVisible.value = false
    loginVisible.value = true
}

/* ---------- 退出登录 ---------- */
const logout = () => {
    ElMessageBox.confirm('确认退出登录？', '提示', {
        type: 'warning',
        confirmButtonText: '退出',   // ← 自定义确认按钮文字
        cancelButtonText: '取消'     // 可选：同时改取消按钮
    }).then(() => {
        localStorage.removeItem('system-user')
        ElMessage.success('已退出')
        // 刷新当前页（或 router.push('/')）
        location.reload()
    })
        .catch(() => { }) // 点取消无动作
}
/* ---------- 菜单高亮 ---------- */
const activeIndex = ref('1')
const routeMap = [
    { prefix: '/cart', index: '2' },
    { prefix: '/user', index: '3' },
    { prefix: '/ushop', index: '4' },
    { prefix: '/', index: '1' }   // 兜底放最后
]
watch(
    () => route.path,
    path => {
        const hit = routeMap.find(item => path.startsWith(item.prefix))
        activeIndex.value = hit ? hit.index : '1'
    },
    { immediate: true }
)
/* ---------- 搜索 ---------- */
const handleSearch = () => {
    const key = searchKey.value.trim()
    if (!key) return ElMessage.warning('请输入搜索关键词')
    router.push({ path: '/search', query: { q: key } })
}
/* ---------- 菜单跳转 ---------- */
const goHome = () => router.push('/')
const goCart = () => checkLogin('/cart')
const goUser = () => checkLogin('/user')
const goUshop = async () => {
    if (!userInfo.value) {
        ElMessage.warning('请先登录')
        loginVisible.value = true
        return
    }
    const shop = await loadUserShop()
    if (shop) {
        // 已有店铺，直接跳转
        router.push('/ushop')
    } else {
        // 未开店，弹出注册
        shopRegisterVisible.value = true
    }
}
/* 判断是否登录 */
const checkLogin = path => {
    if (localStorage.getItem('system-user')) router.push(path)
    else {
        ElMessage.warning('请先登录')
        loginVisible.value = true
    }
}

/* 查询当前用户店铺信息（返回值：店铺对象/null） */
const loadUserShop = async () => {
    if (!userInfo.value) return null
    try {
        const res = await request.get(`/api/shop/list/${userInfo.value.id}`)

        // ① 正常有店
        if (res.code === 200 && res.data?.length) return res.data[0]

        // ② 明确无店（后端返回 400）
        if (res.code === 400 && res.msg?.includes('暂无店铺')) return null

        // ③ 其它异常
        ElMessage.error(res.msg || '店铺信息加载失败')
    } catch {
        ElMessage.error('网络异常，店铺信息加载失败')
    }
    return null
}
</script>

<style scoped>
.nav-header {
    height: 60px;
    /* 60px */
    flex-shrink: 0;
    /* 宽度不随内容变化而变化 */
    display: flex;
    /* 垂直居中 */
    align-items: center;
    /* 水平居中 */
    padding: 0 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .06);
}

/* Logo 固定左侧 */
.logo {
    font-size: 24px;
    font-weight: bold;
    color: #ff5000;
    flex-shrink: 0;
}

/* 新增：登录/注册 */
.auth-bar {
    margin-left: 16px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    /* 手型指针 */
    transition: color .2s;
    /* 与 el-menu 同步过渡 */
}

/* 搜索框区域：永远居中 */
.search-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 0 24px;
}

.search-input {
    width: 200px;
    max-width: 320px;
}

/* 右侧菜单：固定最右 */
.right-menu {
    flex-shrink: 0;
    margin-left: auto;
}

/* .el-main {} */

.avatar-uploader ::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
}

.avatar {
    width: 100px;
    height: 100px;
    display: block;
    object-fit: cover;
}
</style>