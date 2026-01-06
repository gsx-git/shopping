<template>
    <el-container direction="vertical" style="height:98vh;">
        <!-- 顶部导航：沿用 Layout 配色 -->
        <el-header class="nav-header">
            <div class="logo">🛠️ 超级商城-运营后台</div>

            <!-- 右侧：管理员信息 + 退出 -->
            <div class="right-bar">
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="user-drop">
                        <el-avatar :size="32" :src="adminAvatar" />
                        <span class="name">{{ adminInfo?.username || 'Admin' }}</span>
                        <el-icon>
                            <ArrowDown />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="profile">个人主页</el-dropdown-item>
                            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-header>

        <!-- 下方：侧边菜单 + 主内容 -->
        <el-container style="flex:1;">
            <!-- 侧边栏 -->
            <el-aside width="200px" class="side">
                <el-menu :default-active="$route.path" router unique-opened text-color="#fff" active-text-color="#fff"
                    class="orange-menu">
                    <el-menu-item index="/admin/">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>个人主页</span>
                    </el-menu-item>

                    <el-sub-menu index="2">
                        <template #title>
                            <el-icon>
                                <Avatar />
                            </el-icon>
                            <span>用户管理</span>
                        </template>
                        <el-menu-item index="/admin/user">查看用户</el-menu-item>
                        <el-menu-item index="/admin/shop">查看店铺</el-menu-item>
                    </el-sub-menu>

                    <el-menu-item index="/admin/product">
                        <el-icon>
                            <Goods />
                        </el-icon>
                        <span>商品审核</span>
                    </el-menu-item>

                    <el-menu-item index="/admin/banner">
                        <el-icon>
                            <Files />
                        </el-icon>
                        <span>轮播图管理</span>
                    </el-menu-item>

                </el-menu>
            </el-aside>

            <!-- 主内容 -->
            <el-main class="main-wrap">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, User, Avatar, Goods, Files } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

/* 当前管理员信息（与商城端同一套 localStorage） */
const adminInfo = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('system-user') || '')
    } catch {
        return null
    }
})
const adminAvatar = computed(() =>
    adminInfo.value
        ? `${import.meta.env.VITE_BASE_URL}/api/user/${adminInfo.value.id}/avatar`
        : 'https://picsum.photos/100/100?random=admin'
)

/* 下拉菜单 */
const handleCommand = (cmd) => {
    if (cmd === 'profile') {
        router.push('/admin/')
    }
    if (cmd === 'logout') {
        localStorage.removeItem('system-user')
        ElMessage.success('已退出')
        router.replace('/')
    }
}
</script>

<style scoped>
/* 全局样式变量 */
:root {
    --orange-primary: #ff7800;
    /* 橙色 */
    --orange-light: #ff9a44;
    /* 橙色（浅） */
    --orange-dark: #e86a00;
    /* 橙色（深） */
    --orange-gradient: linear-gradient(135deg, var(--orange-primary) 0%, var(--orange-light) 100%);
    --orange-gradient-deep: linear-gradient(135deg, var(--orange-dark) 0%, var(--orange-primary) 100%);
    --bg-blur: rgba(255, 248, 238, 0.85);
    --border-light: rgba(255, 200, 150, 0.5);
}

/* ---------- 顶部导航 ---------- */
.nav-header {
    height: 60px;
    background: rgba(255, 248, 238, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 15px rgba(255, 120, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255, 200, 150, 0.5);
}

.logo {
    font-size: 22px;
    font-weight: 700;
    background: var(--orange-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: #ff7800;
    letter-spacing: 0.5px;
}

.right-bar {
    margin-left: auto;
}

.user-drop {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #e86a00;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.user-drop:hover {
    background: rgba(255, 120, 0, 0.1);
    color: #ff7800;
}

.user-drop .name {
    margin: 0 4px;
    font-weight: 500;
}

/* ---------- 侧边栏：毛玻璃 + 橙色渐变主题 ---------- */
.side {
    width: 220px;
    background: rgba(255, 248, 238, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255, 200, 150, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 3px 0 15px rgba(255, 120, 0, 0.08);
}

/* 菜单整体 */
.side :deep(.orange-menu) {
    border: none;
    background: transparent;
    --el-menu-item-height: 56px;
    width: 100%;
    padding: 12px 0;
}

/* 一级菜单条目 */
.side :deep(.el-menu-item),
.side :deep(.el-sub-menu__title) {
    color: #e86a00;
    margin: 4px 12px;
    border-radius: 10px;
    height: var(--el-menu-item-height);
    line-height: var(--el-menu-item-height);
    padding-left: 24px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
}

/* 悬浮效果 */
.side :deep(.el-menu-item:hover),
.side :deep(.el-sub-menu__title:hover) {
    background: rgba(255, 120, 0, 0.12);
    color: #ff7800;
    transform: translateX(4px);
}

/* 激活态 */
.side :deep(.el-menu-item.is-active) {
    background: linear-gradient(135deg, #e86a00 0%, #ff7800 100%);
    color: #fff !important;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(255, 120, 0, 0.3);
    transform: translateX(2px);
}

/* 子菜单标题特殊处理 */
.side :deep(.el-sub-menu__title) {
    position: relative;
}

/* .side :deep(.el-sub-menu__title::after) {
    content: '';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff9a44;
    opacity: 0.7;
    transition: all 0.3s ease;
} */

.side :deep(.el-sub-menu__title:hover::after) {
    background: #ff7800;
    opacity: 1;
    transform: translateY(-50%) scale(1.2);
}

/* 二级菜单容器 */
.side :deep(.el-menu--inline) {
    background: rgba(255, 245, 235, 0.6);
    margin: 0 12px 8px;
    border-radius: 0 0 10px 10px;
    overflow: hidden;
}

/* 二级菜单项 */
.side :deep(.el-menu--inline .el-menu-item) {
    padding-left: 36px !important;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    border-radius: 0;
    color: #e86a00;
    margin: 0;
}

.side :deep(.el-menu--inline .el-menu-item:hover) {
    background: rgba(255, 120, 0, 0.08);
    color: #ff7800;
    transform: translateX(2px);
}

.side :deep(.el-menu--inline .el-menu-item.is-active) {
    background: rgba(255, 120, 0, 0.15);
    color: #ff7800 !important;
    border-left: 3px solid #ff7800;
    box-shadow: none;
}

/* 菜单图标样式 */
.side :deep(.el-icon) {
    margin-right: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 18px;
}

.side :deep(.el-menu-item:hover .el-icon),
.side :deep(.el-sub-menu__title:hover .el-icon) {
    transform: scale(1.15) rotate(2deg);
    color: #ff7800;
}

.side :deep(.el-menu-item.is-active .el-icon) {
    color: #fff;
    transform: scale(1.1);
}

/* 滚动条美化 */
.side::-webkit-scrollbar {
    width: 6px;
}

.side::-webkit-scrollbar-track {
    background: rgba(255, 240, 220, 0.3);
    border-radius: 3px;
}

.side::-webkit-scrollbar-thumb {
    background: #ff9a44;
    border-radius: 3px;
    transition: all 0.3s ease;
}

.side::-webkit-scrollbar-thumb:hover {
    background: #ff7800;
}

/* ---------- 主内容区域 ---------- */
.main-wrap {
    background: linear-gradient(180deg, #fffbf8 0%, #fff8f2 100%);
    padding: 24px;
    border-radius: 12px 0 0 0;
    box-shadow: inset 0 0 10px rgba(255, 120, 0, 0.05);
}
</style>