<template>
    <div class="user-management">
        <!-- 搜索栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchUsers">
                <el-form-item label="用户名">
                    <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 160px" />
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 160px" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px">
                        <el-option label="正常" :value="0" />
                        <el-option label="禁用" :value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item label="注册时间">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始" end-placeholder="结束" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                        style="width: 240px" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchUsers">
                        <el-icon>
                            <Search />
                        </el-icon> 搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon>
                            <Refresh />
                        </el-icon> 重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 用户列表 -->
        <el-card class="table-card">
            <template #header>
                <div class="table-header">
                    <span>用户列表</span>
                </div>
            </template>

            <el-table :data="userList" stripe v-loading="loading" style="width: 100%">
                <el-table-column type="selection" width="50" />
                <el-table-column prop="id" label="ID" width="70" />
                <el-table-column prop="username" label="用户名" min-width="110" />
                <el-table-column prop="phone" label="手机号" min-width="120" />
                <el-table-column prop="email" label="邮箱" min-width="180" />
                <el-table-column label="头像" width="70">
                    <template #default="{ row }">
                        <el-avatar :src="row.avatar" size="small" />
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="注册时间" min-width="160" />
                <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 0 ? 'success' : 'danger'">
                            {{ row.status === 0 ? '正常' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="190" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" @click="viewUser(row)">
                            <el-icon>
                                <View />
                            </el-icon> 查看
                        </el-button>
                        <el-button size="small" :type="row.status === 0 ? 'warning' : 'success'"
                            @click="toggleStatus(row)">
                            <el-icon>
                                <SwitchButton />
                            </el-icon>
                            {{ row.status === 0 ? '禁用' : '启用' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total,sizes,prev,pager,next,jumper"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </el-card>

        <!-- 用户详情 -->
        <el-dialog v-model="showDetailDialog" title="用户详情" width="600px">
            <el-descriptions :column="2">
                <el-descriptions-item label="ID">{{ detailUser.id }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ detailUser.username }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ detailUser.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ detailUser.email }}</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ detailUser.createTime }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="detailUser.status === 0 ? 'success' : 'danger'">
                        {{ detailUser.status === 0 ? '正常' : '禁用' }}
                    </el-tag>
                </el-descriptions-item>
            </el-descriptions>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, SwitchButton } from '@element-plus/icons-vue'
import request from '@/utils/request'

/* ---------------- 列表 & 分页 ---------------- */
const loading = ref(false)
const searchForm = reactive({
    username: '',
    phone: '',
    status: '',
    dateRange: []
})
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const userList = ref([])

/* 工具函数 */
const pad = n => String(n).padStart(2, '0')
const formatDateTime = arr => {
    if (!Array.isArray(arr) || arr.length < 6) return ''
    const [y, M, d, h, m, s] = arr
    return `${y}-${pad(M)}-${pad(d)} ${pad(h)}:${pad(m)}:${pad(s)}`
}
const getAvatar = row => {
    if (!row.avatar) return ''
    return row.avatar.startsWith('data:') ? row.avatar : `data:image/png;base64,${row.avatar}`
}

/* 时间范围处理 */
const buildRange = () => {
    if (!Array.isArray(searchForm.dateRange) || searchForm.dateRange.length !== 2) return {}
    const [s, e] = searchForm.dateRange
    return {
        startTime: `${s}T00:00:00`,
        endTime: `${e}T23:59:59`
    }
}

/* 拉取数据 */
const fetchUsers = async () => {
    loading.value = true
    try {
        const { startTime, endTime } = buildRange()
        const res = await request.post('/api/user/listAll', {
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            param: {
                username: searchForm.username || null,
                phone: searchForm.phone || null,
                status: searchForm.status === '' ? null : searchForm.status,
                startTime,
                endTime
            }
        })
        userList.value = (res.data || []).map(u => ({
            ...u,
            status: u.status ?? 0,
            createTime: formatDateTime(u.createTime),
            avatar: getAvatar(u)
        }))
        pagination.total = res.total || 0
    } catch {
        ElMessage.error('获取用户列表失败')
    } finally {
        loading.value = false
    }
}

const resetSearch = () => {
    Object.assign(searchForm, { username: '', phone: '', status: '', dateRange: [] })
    pagination.pageNum = 1
    fetchUsers()
}

/* ---------------- 查看详情 ---------------- */
const showDetailDialog = ref(false)
const detailUser = ref({})
const viewUser = row => {
    detailUser.value = { ...row }
    showDetailDialog.value = true
}

/* ---------------- 状态切换 ---------------- */
const toggleStatus = async row => {
    const nextStatus = row.status === 0 ? 1 : 0
    await ElMessageBox.confirm(`确定要${nextStatus === 1 ? '禁用' : '启用'}该用户吗？`)
    const dto = {
        username: row.username,
        phone: row.phone,
        email: row.email,
        password: row.password,
        status: nextStatus
    }
    await request.post(`/api/user/update/${row.id}`, dto)
    row.status = nextStatus
    ElMessage.success('操作成功')
}

/* ---------------- 分页事件 ---------------- */
const handleCurrentChange = page => {
    pagination.pageNum = page
    fetchUsers()
}
const handleSizeChange = size => {
    pagination.pageSize = size
    pagination.pageNum = 1
    fetchUsers()
}

onMounted(() => fetchUsers())
</script>

<style scoped>
.user-management {
    width: 100%;
}

.search-card {
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.table-card {
    margin-top: 20px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
}

.el-button {
    border-radius: 8px;
}
</style>