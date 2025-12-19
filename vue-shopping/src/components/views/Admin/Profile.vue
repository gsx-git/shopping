<template>
    <div class="profile-container">
        <!-- 头部信息卡片 -->
        <el-card class="profile-header">
            <div class="profile-avatar">
                <el-avatar :size="80" :src="avatarUrl">
                    <User />
                </el-avatar>
                <div class="profile-info">
                    <h2>{{ adminInfo?.username || '管理员' }}</h2>
                    <p class="role">超级管理员</p>
                    <p class="join-time">
                        <el-icon>
                            <Calendar />
                        </el-icon>
                        加入时间：{{ formatJoinTime() }}
                    </p>
                </div>
                <el-button type="primary" @click="editProfile">
                    <el-icon>
                        <Edit />
                    </el-icon>
                    编辑资料
                </el-button>
            </div>
        </el-card>

        <!-- 基础信息表单 -->
        <el-card class="profile-form-card">
            <template #header>
                <div class="card-header">
                    <span>基础信息</span>
                </div>
            </template>
            <el-form :model="profileForm" label-width="100px" class="profile-form">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="profileForm.username" disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="profileForm.phone" :disabled="!isEditing" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="profileForm.email" :disabled="!isEditing" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="所属部门" prop="department">
                            <el-input v-model="profileForm.department" :disabled="!isEditing" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="个人简介" prop="intro">
                    <el-input v-model="profileForm.intro" type="textarea" :rows="4" :disabled="!isEditing"
                        placeholder="请输入个人简介" />
                </el-form-item>
                <el-form-item v-if="isEditing">
                    <el-button type="primary" @click="saveProfile">保存修改</el-button>
                    <el-button @click="cancelEdit">取消</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 密码修改卡片 -->
        <!-- <el-card class="password-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span>修改密码</span>
                </div>
            </template>
            <el-form :model="passwordForm" label-width="100px" class="password-form" @submit.prevent="changePassword">
                <el-form-item label="原密码" prop="oldPassword" :rules="oldPwdRules">
                    <el-input v-model="passwordForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword" :rules="newPwdRules">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword" :rules="confirmPwdRules">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="changePassword">修改密码</el-button>
                </el-form-item>
            </el-form>
        </el-card> -->

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Calendar, Edit } from '@element-plus/icons-vue'

// 管理员信息
const adminInfo = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('system-user') || '{}')
    } catch {
        return {}
    }
})

// 头像地址
const avatarUrl = computed(() =>
    adminInfo.value.id
        ? `${import.meta.env.VITE_BASE_URL}/api/user/${adminInfo.value.id}/avatar`
        : 'https://picsum.photos/100/100?random=admin'
)

// 编辑状态
const isEditing = ref(false)

// 个人资料表单
const profileForm = ref({
    username: '',
    phone: '',
    email: '',
    department: '运营部',
    intro: ''
})

// 密码修改表单
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// 密码验证规则
const oldPwdRules = [{ required: true, message: '请输入原密码', trigger: 'blur' }]
const newPwdRules = [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
]
const confirmPwdRules = [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
        validator: (rule, value, callback) => {
            if (value !== passwordForm.value.newPassword) {
                callback(new Error('两次输入的密码不一致'))
            } else {
                callback()
            }
        },
        trigger: 'blur'
    }
]

// 初始化表单数据
onMounted(() => {
    profileForm.value.username = adminInfo.value.username || '管理员'
    profileForm.value.phone = adminInfo.value.phone || ''
    profileForm.value.email = adminInfo.value.email || ''
})

// 格式化加入时间
const formatJoinTime = () => {
    // 模拟数据，实际项目中从接口获取
    return '2025-01-15'
}

// 编辑资料
const editProfile = () => {
    isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
    isEditing.value = false
    // 重置表单
    profileForm.value.phone = adminInfo.value.phone || ''
    profileForm.value.email = adminInfo.value.email || ''
}

// 保存资料修改
const saveProfile = () => {
    // 模拟接口请求
    ElMessageBox.confirm('确认保存修改吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        // 实际项目中调用保存接口
        await new Promise(resolve => setTimeout(resolve, 800))
        ElMessage.success('资料修改成功！')
        isEditing.value = false
        // 更新本地存储
        const newInfo = { ...adminInfo.value, ...profileForm.value }
        localStorage.setItem('system-user', JSON.stringify(newInfo))
    }).catch(() => {
        ElMessage.info('已取消保存')
    })
}

// 修改密码
const changePassword = () => {
    if (!passwordForm.value.oldPassword) {
        ElMessage.warning('请输入原密码')
        return
    }
    if (!passwordForm.value.newPassword) {
        ElMessage.warning('请输入新密码')
        return
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
    }

    ElMessageBox.confirm('确认修改密码吗？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'error'
    }).then(async () => {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('密码修改成功，请重新登录')
        // 清空密码表单
        passwordForm.value = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
        // 实际项目中退出登录
        // localStorage.removeItem('system-user')
        // router.push('/login')
    }).catch(() => {
        ElMessage.info('已取消修改')
    })
}
</script>

<style scoped>
.profile-container {
    max-width: 800px;
    margin: 0 auto;
}

.profile-header {
    margin-bottom: 24px;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.profile-avatar {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.profile-info {
    flex: 1;
}

.profile-info h2 {
    margin: 0 0 8px 0;
    color: var(--orange-dark);
    font-size: 20px;
}

.profile-info .role {
    color: #ff9a44;
    margin: 0 0 4px 0;
    font-size: 14px;
}

.profile-info .join-time {
    color: #999;
    margin: 0;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.profile-form-card,
.password-card {
    margin-bottom: 24px;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--orange-dark);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-form,
.password-form {
    padding-top: 16px;
}

.el-form-item {
    margin-bottom: 16px;
}

.el-button {
    padding: 8px 16px;
    border-radius: 8px;
    background: var(--orange-gradient);
    border: none;
}

.el-button--primary {
    background: var(--orange-gradient-deep);
}

.el-button--primary:hover {
    background: var(--orange-gradient);
}
</style>