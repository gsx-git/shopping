import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'Home', component: () => import('@/components/views/Home.vue') },
      { path: 'category/:id?', name: 'Category', component: () => import('@/components/views/Category.vue') },
      { path: 'cart', name: 'Cart', component: () => import('@/components/views/Cart.vue') },
      { path: 'user', name: 'User', component: () => import('@/components/views/user/User.vue') },
      { path: 'user/orders/:id', name: 'Orders', component: () => import('@/components/views/user/Orders.vue') },
      { path: 'user/orderdetail/:orderId', name: 'OrderDetail', component: () => import('@/components/views/user/OrderDetail.vue') },
      { path: 'user/address', name: 'Address', component: () => import('@/components/views/user/Address.vue') },
      { path: 'user/collect', name: 'Collect', component: () => import('@/components/views/user/Collect.vue') },
      { path: 'user/track', name: 'Track', component: () => import('@/components/views/user/Track.vue') },
      { path: 'user/service', name: 'Service', component: () => import('@/components/views/user/Service.vue') },
      { path: 'shop', name: 'Ushop', component: () => import('@/components/views/Shop/Shop.vue') },
      { path: 'shop/detail/:id', name: 'ShopDetail', component: () => import('@/components/views/Shop/ShopDetail.vue') },
      { path: 'shop/orders/:id', name: 'ShopOrders', component: () => import('@/components/views/Shop/ShopOrders.vue') },
      { path: 'shop/product', name: 'ShopProduct', component: () => import('@/components/views/Shop/ShopProduct.vue'), meta: { title: '商品管理' } },
      { path: 'shop/sales/:id', name: 'ShopSales', component: () => import('@/components/views/Shop/ShopSales.vue') },
      { path: 'search', name: 'Search', component: () => import('@/components/views/Search.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('@/components/views/ProductDetail.vue') },
    ]
  }
]

export default createRouter({ history: createWebHistory(), routes })