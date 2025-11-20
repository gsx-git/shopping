<template>
    <el-main class="service-main">
        <!-- 联系客服卡片 -->
        <el-card class="service-card">
            <template #header>
                <div class="service-header">
                    <span>联系客服</span>
                    <!-- 返回按钮 -->
                    <el-button type="text" @click="goBack" class="back-button">
                        返回 <i class="el-icon-arrow-left"></i>
                    </el-button>
                </div>
            </template>
            <div class="service-content">
                <p>如果您有任何问题或需要帮助，请通过以下方式联系我们：</p>
                <div class="contact-method">
                    <el-icon>
                        <Phone />
                    </el-icon>
                    <span>客服热线：123-456-7890</span>
                </div>
                <!-- <div class="contact-method">
                    <el-icon>
                        <Message />
                    </el-icon>
                    <span>在线客服：点击这里</span>
                </div> -->
                <div class="contact-method">
                    <el-icon>
                        <Message />
                    </el-icon>
                    <span>客服邮箱：service@example.com</span>
                </div>
            </div>
        </el-card>
    </el-main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Message } from '@element-plus/icons-vue'

const router = useRouter()

/* 返回上一页 */
const goBack = () => {
    router.back()
}
</script>

<style scoped>
.service-main {
    background-color: #f5f5f5;
    min-height: calc(100vh - 60px);
    padding: 20px;
}

.back-button {
    color: #ff5000;
    font-size: 14px;
}

.service-card {
    margin-bottom: 20px;
}

.service-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.service-content {
    padding: 20px;
}

.contact-method {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.contact-method span {
    margin-left: 10px;
    font-size: 14px;
    color: #333;
}
</style>