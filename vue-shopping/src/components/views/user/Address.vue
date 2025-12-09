<template>
  <el-main class="address-main">
    <el-card class="address-card">
      <template #header>
        <div class="address-header">
          <span>收货地址</span>
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>

      <!-- 骨架屏 -->
      <el-skeleton v-if="loading" :rows="4" animated />

      <!-- 地址表格 -->
      <el-table v-else :data="addresses" row-key="id" show-overflow-tooltip>
        <el-table-column label="收货人" width="120">
          <template #default="{ row }">{{ row.receiver }}</template>
        </el-table-column>
        <el-table-column label="手机号码" width="150">
          <template #default="{ row }">{{ row.phone }}</template>
        </el-table-column>
        <el-table-column label="地址" min-width="220">
          <template #default="{ row }">
            <span v-if="row.isDefault" style="color:#ff5000;margin-right:4px">[默认]</span>
            {{ row.address }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" @click="openAddressDialog('edit', row)">编辑</el-button>
            <el-button type="text" @click="deleteAddress(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!loading && addresses.length === 0" description="暂无收货地址" />
    </el-card>

    <!-- 新增按钮 -->
    <div class="address-actions">
      <el-button type="primary" @click="openAddressDialog('add')">新增地址</el-button>
    </div>

    <!-- 弹窗表单 -->
    <el-dialog v-model="addressDialogVisible" :title="dialogTitle">
      <el-form :model="addressForm" label-width="100px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名" />
        </el-form-item>

        <el-form-item label="手机号码">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
        </el-form-item>

        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="省份" label-width="100px">
              <el-input v-model="addressForm.province" placeholder="省" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label-width="0">
              <el-input v-model="addressForm.city" placeholder="市" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label-width="0">
              <el-input v-model="addressForm.detailAddress" placeholder="详细地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault" active-color="#ff5000" :active-value="true"
            :inactive-value="false" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOrUpdateAddress">保存</el-button>
      </template>
    </el-dialog>
  </el-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import request from '@/utils/request'

const router = useRouter()

/* 响应式数据 */
const loading = ref(true)
const addresses = ref([])
const rawList = ref([])

/* 弹窗数据 */
const addressDialogVisible = ref(false)
const addressForm = ref({
  id: '',
  receiver: '',
  phone: '',
  province: '',
  city: '',
  detailAddress: ''
})
const dialogTitle = ref('新增地址')
const dialogMode = ref('add')

/* 核心：拉真实地址 */
const fetchAddresses = async () => {
  try {
    const raw = localStorage.getItem('system-user')
    const user = raw ? JSON.parse(raw) : null
    console.log('当前地址页user:', user)
    if (!user || !user.id) {
      ElMessage.warning('请先登录')
      return
    }

    const { data } = await request.get(`/api/useraddress/list/${user.id}`)
    console.log('data 结构', data)
    // 先存原始数据
    rawList.value = Array.isArray(data) ? data : data.data ?? []
    // 拼地址 + 默认置顶
    addresses.value = (Array.isArray(data) ? data : data.data ?? [])
      .map(item => ({
        id: item.id,
        receiver: item.receiver,
        phone: item.phone,
        address: `${item.province || ''}${item.city || ''}${item.detailAddress || ''}`.replace(/\s+/g, ''),
        isDefault: item.isDefault
      }))
      .sort((a, b) => b.isDefault - a.isDefault)   // 默认在前

    console.log('当前地址:', addresses)
  } catch (e) {
    ElMessage.error('获取地址失败')
  } finally {
    loading.value = false
  }
}

/* 新增 / 编辑 */
const openAddressDialog = (mode, row = null) => {
  dialogMode.value = mode
  if (mode === 'edit' && row) {
    const raw = rawList.value.find(r => r.id === row.id) || {}
    addressForm.value = {
      id: row.id,
      receiver: row.receiver,
      phone: row.phone,
      province: raw.province || '',
      city: raw.city || '',
      detailAddress: raw.detailAddress || '',
      isDefault: row.isDefault
    }
    dialogTitle.value = '修改地址'
  } else {
    addressForm.value = {
      id: '',
      receiver: '',
      phone: '',
      province: '',
      city: '',
      detailAddress: '',
      isDefault: false
    }
    dialogTitle.value = '新增地址'
  }
  addressDialogVisible.value = true
}

const saveOrUpdateAddress = async () => {
  const { receiver, phone, province, city, detailAddress } = addressForm.value
  if (!receiver || !phone || !province || !city || !detailAddress) {
    ElMessage.error('请把地址信息填写完整')
    return
  }

  const raw = localStorage.getItem('system-user')
  const user = raw ? JSON.parse(raw) : null

  const payload = {
    user: { id: user.id },
    receiver,
    phone,
    province,
    city,
    detailAddress,
    isDefault: addressForm.value.isDefault
  }

  try {
    if (dialogMode.value === 'add') {
      await request.post('/api/useraddress/add', payload)
      ElMessage.success('地址已新增')
    } else {
      await request.post(`/api/useraddress/update`, {
        id: addressForm.value.id,
        ...payload,
      })
      ElMessage.success('地址已更新')
    }
    addressDialogVisible.value = false
    fetchAddresses()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

/* 删除 */
const deleteAddress = async (id) => {
  try {
    await request.delete(`/api/useraddress/delete/${id}`)
    ElMessage.success('地址已删除')
    fetchAddresses()
  } catch {
    ElMessage.error('删除失败')
  }
}

const goBack = () => router.back()

onMounted(fetchAddresses)
</script>

<style scoped>
.address-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.back-button {
  color: #ff5000;
  font-size: 14px;
}

.address-card {
  margin-bottom: 20px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-actions {
  text-align: center;
}
</style>