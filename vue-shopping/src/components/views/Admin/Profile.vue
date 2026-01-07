<!-- AdminProfile.vue -->
<template>
    <div class="profile-container">
        <!-- 头部信息 -->
        <el-card class="profile-header">
            <div class="profile-avatar">
                <el-avatar :size="80" :src="avatarUrl">
                    <el-icon>
                        <User />
                    </el-icon>
                </el-avatar>

                <div class="profile-info">
                    <h2>{{ admin.username || '管理员' }}</h2>
                    <p class="role">超级管理员</p>
                    <p class="join-time">
                        <el-icon>
                            <Calendar />
                        </el-icon>
                        加入时间：{{ formatJoinTime(admin.createTime) }}
                    </p>
                </div>

                <el-button @click="startEdit">
                    <el-icon>
                        <Edit />
                    </el-icon>
                    编辑资料
                </el-button>
            </div>
        </el-card>

        <!-- 基础信息 -->
        <el-card class="profile-form-card">
            <template #header>
                <span class="card-title">基础信息</span>
            </template>

            <el-form ref="formRef" :model="form" label-width="100" :disabled="!isEditing">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="用户名">
                            <el-input v-model="form.username" disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="form.phone" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="form.email" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item v-if="isEditing">
                    <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
                    <el-button @click="cancel">取消</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Calendar, Edit } from '@element-plus/icons-vue'

/* ---------- 数据 ---------- */
const admin = computed(() => {
    try {
        return JSON.parse(localStorage.getItem('system-user') || '{}')
    } catch {
        return {}
    }
})

const avatarUrl = computed(() =>
    admin.value.id
        ? `${import.meta.env.VITE_BASE_URL}/api/user/${admin.value.id}/avatar`
        : 'https://picsum.photos/100/100?random=admin'
)

/* ---------- 表单 ---------- */
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref()

const form = reactive({
    username: admin.value.username || '管理员',
    phone: admin.value.phone || '',
    email: admin.value.email || ''
})

/* ---------- 方法 ---------- */
function formatJoinTime(arr) {
    if (!Array.isArray(arr) || arr.length < 7) return '2023-01-01'
    const [y, m, d] = arr
    return new Date(y, m - 1, d).toLocaleDateString()
}

function startEdit() {
    isEditing.value = true
}

function cancel() {
    isEditing.value = false
    // 还原
    form.phone = admin.value.phone || ''
    form.email = admin.value.email || ''
}

/* ---------- 新增：真正调用后端 ---------- */
import axios from 'axios'
import request from '@/utils/request'

async function submit() {
    await formRef.value.validate().catch(() => {
        ElMessage.warning('请完善信息')
        throw new Error('invalid')
    })

    await ElMessageBox.confirm('确认保存修改？', '提示', { type: 'warning' })

    saving.value = true
    try {
        // 1. 组装后端需要的 DTO
        const dto = {
            username: form.username,
            phone: form.phone,
            email: form.email,
            password: admin.value.password,   // 原密码保持不变（如需改密可再开接口）
            status: admin.value.status ?? 1
        }

        // 2. 调接口
        const { data } = await request.post(`/api/user/update/${admin.value.id}`, dto)

        // if (!data.success) throw new Error(data.message || '更新失败')

        // 3. 更新本地缓存
        const payload = { ...admin.value, ...form }
        localStorage.setItem('system-user', JSON.stringify(payload))

        ElMessage.success('资料已更新')
        isEditing.value = false
    } catch (e) {
        ElMessage.error(e?.response?.data?.message || e.message || '更新失败')
    } finally {
        saving.value = false
    }
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

.join-time {
    color: #999;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--orange-dark);
}

.profile-form-card {
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}
</style>