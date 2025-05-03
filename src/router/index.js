// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import PharmacyList from '../components/PharmacyList.vue'
import MedicineList from '../components/MedicineList.vue'
import CheckoutNow from '../components/CheckoutNow.vue'
import OrderHistory from '@/components/OrderHistory.vue'

const routes = [
  {
    path: '/',
    name: 'PharmacyList',
    component: PharmacyList
  },
  {
    path: '/medicine/:pharmacyId',
    name: 'MedicineList',
    component: MedicineList,
    props: route => ({
      selectedPharmacyId: route.params.pharmacyId,
      selectedPharmacy: route.params.pharmacy || {}
    })
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutNow,
    props: route => ({
      cartItems: route.params.cartItems || [],
      pharmacy: route.params.pharmacy || {}
    })
  },
  {
    path: '/order-history',
    name: 'OrderHistory',
    component: OrderHistory
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router