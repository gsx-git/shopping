<template>
    <div class="user-management">
        <!-- 搜索筛选栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline @submit.prevent="fetchUsers">
                <el-form-item label="用户名">
                    <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="全部" clearable>
                        <el-option label="正常" value="normal" />
                        <el-option label="禁用" value="disabled" />
                    </el-select>
                </el-form-item>
                <el-form-item label="注册时间">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchUsers">
                        <el-icon>
                            <Search />
                        </el-icon>
                        搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 用户列表 -->
        <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
                <div class="table-header">
                    <span>用户列表</span>
                    <el-button type="primary" size="small" @click="showAddUserDialog = true">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新增用户
                    </el-button>
                </div>
            </template>

            <el-table :data="userList" stripe v-loading="loading" style="width: 100%;"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" min-width="120" />
                <el-table-column prop="phone" label="手机号" min-width="120" />
                <el-table-column prop="email" label="邮箱" min-width="150" />
                <el-table-column prop="avatar" label="头像" width="80">
                    <template #default="scope">
                        <el-avatar :src="scope.row.avatar" size="40" />
                    </template>
                </el-table-column>
                <el-table-column prop="registerTime" label="注册时间" min-width="180" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
                            {{ scope.row.status === 'normal' ? '正常' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="viewUser(scope.row)">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看
                        </el-button>
                        <el-button size="small" type="warning"
                            @click="handleStatusChange(scope.row, scope.row.status === 'normal' ? 'disabled' : 'normal')">
                            <el-icon>
                                <SwitchButton />
                            </el-icon>
                            {{ scope.row.status === 'normal' ? '禁用' : '启用' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper" @size-change="fetchUsers" @current-change="fetchUsers"
                style="margin-top: 20px; text-align: right;" />
        </el-card>

        <!-- 新增/编辑用户弹窗 -->
        <el-dialog v-model="showAddUserDialog" title="新增用户" width="600px" :close-on-click-modal="false">
            <el-form :model="userForm" label-width="100px" :rules="userFormRules" ref="userFormRef">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="userForm.status">
                        <el-option label="正常" value="normal" />
                        <el-option label="禁用" value="disabled" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddUserDialog = false">取消</el-button>
                <el-button type="primary" @click="saveUser">确认</el-button>
            </template>
        </el-dialog>

        <!-- 用户详情弹窗 -->
        <el-dialog v-model="showUserDetailDialog" title="用户详情" width="600px" :close-on-click-modal="false">
            <el-descriptions :column="2" border :data="currentUser">
                <el-descriptions-item label="用户ID" prop="id" />
                <el-descriptions-item label="用户名" prop="username" />
                <el-descriptions-item label="手机号" prop="phone" />
                <el-descriptions-item label="邮箱" prop="email" />
                <el-descriptions-item label="注册时间" prop="registerTime" />
                <el-descriptions-item label="最后登录时间" prop="lastLoginTime" />
                <el-descriptions-item label="状态">
                    <el-tag :type="currentUser.status === 'normal' ? 'success' : 'danger'">
                        {{ currentUser.status === 'normal' ? '正常' : '禁用' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="用户等级" prop="level" />
                <el-descriptions-item label="积分" prop="points" />
                <el-descriptions-item label="消费金额" prop="consumeAmount" />
            </el-descriptions>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, SwitchButton } from '@element-plus/icons-vue'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
    username: '',
    phone: '',
    status: '',
    dateRange: []
})

// 分页参数
const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

// 用户列表
const userList = ref([])

// 弹窗状态
const showAddUserDialog = ref(false)
const showUserDetailDialog = ref(false)

// 当前选中用户
const currentUser = ref({})

// 用户表单
const userFormRef = ref(null)
const userForm = reactive({
    username: '',
    phone: '',
    email: '',
    password: '',
    status: 'normal'
})

// 表单验证规则
const userFormRules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
})

// 模拟获取用户列表
const fetchUsers = async () => {
    loading.value = true
    try {
        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        // 模拟数据
        userList.value = Array.from({ length: pagination.pageSize }, (_, index) => ({
            id: (pagination.pageNum - 1) * pagination.pageSize + index + 1,
            username: `user${(pagination.pageNum - 1) * pagination.pageSize + index + 1}`,
            phone: `138${Math.floor(Math.random() * 100000000)}`,
            email: `user${(pagination.pageNum - 1) * pagination.pageSize + index + 1}@example.com`,
            avatar: `https://picsum.photos/100/100?random=${(pagination.pageNum - 1) * pagination.pageSize + index + 1}`,
            registerTime: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
            lastLoginTime: '2025-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
            status: Math.random() > 0.1 ? 'normal' : 'disabled',
            level: Math.floor(Math.random() * 5) + 1,
            points: Math.floor(Math.random() * 10000),
            consumeAmount: Math.floor(Math.random() * 100000) / 100
        }))

        pagination.total = 86 // 模拟总条数
    } catch (error) {
        ElMessage.error('获取用户列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 重置搜索
const resetSearch = () => {
    searchForm.username = ''
    searchForm.phone = ''
    searchForm.status = ''
    searchForm.dateRange = []
    pagination.pageNum = 1
    fetchUsers()
}

// 查看用户详情
const viewUser = (user) => {
    currentUser.value = { ...user }
    showUserDetailDialog.value = true
}

// 切换用户状态
const handleStatusChange = async (user, status) => {
    try {
        await ElMessageBox.confirm(
            `确认要${status === 'disabled' ? '禁用' : '启用'}该用户吗？`,
            '提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: status === 'disabled' ? 'warning' : 'info'
            }
        )

        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 500))

        // 更新列表状态
        user.status = status
        ElMessage.success(`用户${status === 'disabled' ? '禁用' : '启用'}成功`)
    } catch (error) {
        ElMessage.info('已取消操作')
    }
}

// 保存用户
const saveUser = async () => {
    try {
        await userFormRef.value.validate()

        // 模拟接口请求
        await new Promise(resolve => setTimeout(resolve, 800))

        ElMessage.success('用户创建成功')
        showAddUserDialog.value = false
        // 重置表单
        userForm.username = ''
        userForm.phone = ''
        userForm.email = ''
        userForm.password = ''
        userForm.status = 'normal'
        // 重新获取列表
        fetchUsers()
    } catch (error) {
        console.error(error)
    }
}

// 监听选择事件
const handleSelectionChange = (val) => {
    console.log('选中的用户：', val)
}

// 初始化
onMounted(() => {
    fetchUsers()
})
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
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-blur);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--orange-dark);
}

.el-table {
    --el-table-header-text-color: var(--orange-dark);
    --el-table-row-hover-bg-color: rgba(255, 120, 0, 0.05);
    --el-table-current-row-bg-color: rgba(255, 120, 0, 0.1);
}

.el-descriptions {
    --el-descriptions-label-color: var(--orange-dark);
    --el-descriptions-content-color: #666;
}

.el-button {
    border-radius: 8px;
}

.el-button--primary {
    background: var(--orange-gradient-deep);
    border: none;
}

.el-button--primary:hover {
    background: var(--orange-gradient);
}

.el-button--warning {
    background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
    border: none;
}
</style>