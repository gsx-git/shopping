<template>
  <el-main class="address-main">


    <!-- 收货地址卡片 -->
    <el-card class="address-card">
      <template #header>
        <div class="address-header">
          <span>收货地址</span>
          <!-- 返回按钮 -->
          <el-button type="text" @click="goBack" class="back-button">
            返回 <i class="el-icon-arrow-left"></i>
          </el-button>
        </div>
      </template>
      <el-table :data="addresses" row-key="id" show-overflow-tooltip>
        <el-table-column label="收货人" width="120">
          <template #default="{ row }">{{ row.receiver }}</template>
        </el-table-column>
        <el-table-column label="手机号码" width="150">
          <template #default="{ row }">{{ row.phone }}</template>
        </el-table-column>
        <el-table-column label="地址" min-width="200">
          <template #default="{ row }">{{ row.address }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" @click="openAddressDialog('edit', row)">编辑</el-button>
            <el-button type="text" @click="deleteAddress(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增操作栏 -->
    <div class="address-actions">
      <el-button type="primary" @click="openAddressDialog('add')">新增地址</el-button>
    </div>

    <!-- 地址操作弹窗 -->
    <el-dialog v-model="addressDialogVisible" :title="dialogTitle">
      <el-form :model="addressForm" label-width="100px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.address" placeholder="请输入详细地址"></el-input>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const addresses = ref([])

/* 获取收货地址列表 */
const fetchAddresses = () => {
  // 模拟从后端获取收货地址列表
  addresses.value = [
    {
      id: '1',
      receiver: '张三',
      phone: '13800000000',
      address: '北京市海淀区中关村大街1号'
    },
    {
      id: '2',
      receiver: '李四',
      phone: '13900000000',
      address: '上海市浦东新区张江高科技园区'
    }
  ]
}

/* 地址操作弹窗 */
const addressDialogVisible = ref(false)
const addressForm = ref({
  id: '',
  receiver: '',
  phone: '',
  address: ''
})
const dialogTitle = ref('新增地址')
const dialogMode = ref('add')

const openAddressDialog = (mode, address = null) => {
  dialogMode.value = mode
  if (mode === 'edit' && address) {
    addressForm.value = { ...address }
    dialogTitle.value = '修改地址'
  } else {
    addressForm.value = {
      id: '',
      receiver: '',
      phone: '',
      address: ''
    }
    dialogTitle.value = '新增地址'
  }
  addressDialogVisible.value = true
}

const saveOrUpdateAddress = () => {
  if (!addressForm.value.receiver || !addressForm.value.phone || !addressForm.value.address) {
    ElMessage.error('请填写完整信息')
    return
  }
  if (dialogMode.value === 'add') {
    const newAddress = {
      id: Date.now().toString(),
      receiver: addressForm.value.receiver,
      phone: addressForm.value.phone,
      address: addressForm.value.address
    }
    addresses.value.push(newAddress)
    ElMessage.success('地址已新增')
  } else {
    const index = addresses.value.findIndex(addr => addr.id === addressForm.value.id)
    if (index > -1) {
      addresses.value[index] = { ...addressForm.value }
      ElMessage.success('地址已更新')
    }
  }
  addressDialogVisible.value = false
}

/* 删除地址 */
const deleteAddress = (id) => {
  const index = addresses.value.findIndex(addr => addr.id === id)
  if (index > -1) {
    addresses.value.splice(index, 1)
    ElMessage.success('地址已删除')
  }
}

/* 返回上一页 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchAddresses()
})
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
  margin-bottom: 12px;
  text-align: center;
}
</style>