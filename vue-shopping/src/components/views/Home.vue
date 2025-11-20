<template>
  <!-- 主体 -->
  <el-main>
    <!-- 轮播 -->
    <el-carousel height="400px" indicator-position="outside">
      <el-carousel-item v-for="(src, idx) in banners" :key="idx">
        <img :src="src" class="banner-img" />
      </el-carousel-item>
    </el-carousel>

    <!-- 分类 -->
    <el-row justify="center" class="category-row" :gutter="20">
      <el-col v-for="c in categories" :key="c.id" :span="4">
        <el-card shadow="hover" :body-style="{ padding: '20px', textAlign: 'center' }" @click="goCategory(c.name)">
          <img :src="c.icon" class="category-icon" />
          <div>{{ c.name }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 限时秒杀 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>⚡ 限时秒杀</span>
          <span class="count-down">距结束 {{ countDown }}</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col v-for="p in seckillList" :key="p.id" :span="6">
          <el-card shadow="hover" :body-style="{ padding: 0 }" @click="goDetail(p.id)">
            <img :src="p.img" class="goods-img" />
            <div class="goods-info">
              <div class="title">{{ p.title }}</div>
              <div class="price">
                <span class="now">¥{{ p.price }}</span>
                <s class="old">¥{{ p.originPrice }}</s>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 猜你喜欢 -->
    <el-card class="section-card">
      <template #header>💡 猜你喜欢</template>
      <el-row :gutter="20">
        <el-col v-for="p in guessList" :key="p.id" :span="6">
          <el-card shadow="hover" :body-style="{ padding: 0 }" @click="goDetail(p.id)">
            <img :src="p.img" class="goods-img" />
            <div class="goods-info">
              <div class="title">{{ p.title }}</div>
              <div class="price">
                <span class="now">¥{{ p.price }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </el-main>

  <!-- 页脚 -->
  <el-footer class="footer">
    © 2025 超级商城 | 让购物更简单
  </el-footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

/* 轮播图 */
const banners = ref([
  'https://picsum.photos/1440/400?random=1',
  'https://picsum.photos/1440/400?random=2',
  'https://picsum.photos/1440/400?random=3'
])

/* 分类 */
const categories = ref([
  { id: 1, name: '数码', icon: 'https://picsum.photos/120/120?random=4' },
  { id: 2, name: '服饰', icon: 'https://picsum.photos/120/120?random=5' },
  { id: 3, name: '食品', icon: 'https://picsum.photos/120/120?random=6' },
  { id: 4, name: '家居', icon: 'https://picsum.photos/120/120?random=7' },
  { id: 5, name: '美妆', icon: 'https://picsum.photos/120/120?random=8' },
  { id: 6, name: '运动', icon: 'https://picsum.photos/120/120?random=9' }
])
const goCategory = name => {
  router.push(`/category/${name}`)
}

/* 秒杀倒计时 */
const seckillEnd = ref(Date.now() + 1000 * 60 * 60 * 2)
const countDown = ref('')
let timer = null
const updateTime = () => {
  const diff = Math.max(0, Math.floor((seckillEnd.value - Date.now()) / 1000))
  const h = String(Math.floor(diff / 3600)).padStart(2, '0')
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
  const s = String(diff % 60).padStart(2, '0')
  countDown.value = `${h}:${m}:${s}`
}
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))

/* 秒杀商品 */
const seckillList = ref(
  Array.from({ length: 4 }, (_, i) => ({
    id: `s-${i}`,
    title: `秒杀商品-${i + 1}`,
    price: (99 + i * 10).toFixed(2),
    originPrice: (199 + i * 20).toFixed(2),
    img: `https://picsum.photos/300/300?random=${Date.now() + 10 + i}`
  }))
)

/* 猜你喜欢 */
const guessList = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: `g-${i}`,
    title: `热门好物-${i + 1}`,
    price: (199 + i * 30).toFixed(2),
    img: `https://picsum.photos/300/300?random=${Date.now() + 20 + i}`
  }))
)

/* 跳转到商品详情页 */
const goDetail = (id) => {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-row {
  margin: 40px 0;
}

.category-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.section-card {
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-down {
  font-size: 14px;
  color: #ff5000;
  font-weight: bold;
}

.goods-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.goods-info {
  padding: 12px;
  text-align: center;
}

.title {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  margin-bottom: 10px;
}

.now {
  color: #ff5000;
  font-size: 16px;
  margin-right: 8px;
}

.old {
  font-size: 12px;
  color: #999;
}

.footer {
  text-align: center;
  font-size: 14px;
  color: #999;
}

/* 追加样式，保持 Logo 和菜单各自宽度，中间自动填满并居中 */
.nav-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .06);
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #ff5000;
  flex-shrink: 0;
  /* 不让 Logo 被压缩 */
}
</style>