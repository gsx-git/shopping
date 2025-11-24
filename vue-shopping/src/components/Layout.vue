<template>
    <el-header class="nav-header">
        <div class="logo">🛒 超级商城</div>
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

    <el-main><router-view /></el-main>

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
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from "@/utils/request";

const route = useRoute()
const router = useRouter()
const searchKey = ref('')

const handleSearch = () => {
    const key = searchKey.value.trim()
    if (!key) return ElMessage.warning('请输入搜索关键词')
    router.push({ path: '/search', query: { q: key } })
}

const loginVisible = ref(false)
const loginForm = reactive({ phone: '', password: '' })
const confirmLogin = () => {
  // 简单校验
  if (!loginForm.phone || !loginForm.password) {
    ElMessage.warning('请填写完整')
    return
  }

  // 调后台登录接口（路径按你实际的来）
  request.post('/api/user/login', {          // 与示例保持一致
    phone: loginForm.phone,
    password: loginForm.password
  }).then(res => {
    if (res.code === 200) {             // 业务成功
      ElMessage.success('登录成功')
      localStorage.setItem('system-user', JSON.stringify(res.data)) // 存用户信息
      loginVisible.value = false        // 关闭弹窗
      router.push('/')                  // 跳到首页
    } else {                            // 业务失败
      ElMessage.error(res.msg || '登录失败')
    }
  }).catch(err => {                     // 网络 / 系统异常
    console.error(err)
    ElMessage.error('网络异常，请稍后再试')
  })
}
/* 高亮下标（与 index 对应） */
const activeIndex = ref('1')

/* 路由 → 高亮映射（支持前缀） */
const routeMap = [
    { prefix: '/cart', index: '2' },
    { prefix: '/user', index: '3' },
    { prefix: '/ushop', index: '4' },
    { prefix: '/', index: '1' }   // 兜底放最后
]

/* 根据当前路径设置高亮（首次 + 变化） */
watch(
    () => route.path,
    path => {
        const hit = routeMap.find(item => path.startsWith(item.prefix))
        activeIndex.value = hit ? hit.index : '1'
    },
    { immediate: true }
)
/* 点击方法：跳转 + 高亮 */
const goHome = () => {
    router.push('/')
}
const goCart = () => {
    if (localStorage.getItem('token')) router.push('/cart')
    else {
        ElMessage.warning('请先登录')
        loginVisible.value = true
    }
}
const goUser = () => {
    /* 登录拦截 */
    router.push('/user')
    // if (localStorage.getItem('token')) 
    // else {
    //     ElMessage.warning('请先登录')
    //     loginVisible.value = true
    // }
}
const goUshop = () => {
    if (localStorage.getItem('token')) router.push('/ushop')
    else {
        ElMessage.warning('请先登录')
        loginVisible.value = true
    }
}
</script>

<style scoped>
.nav-header {
    display: flex;
    align-items: center;
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
</style>