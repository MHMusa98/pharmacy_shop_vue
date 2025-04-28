import { createRouter, createWebHistory } from 'vue-router'
import CheckoutNow from '@/components/CheckoutNow.vue'
import PharmacyList from '@/components/PharmacyList.vue'
import MedicineList from '@/components/MedicineList.vue'

const routes = [
  {
    path: '/medicine-list',
    name: 'MedicineList',
    component: MedicineList
  },
  {
    path: '/',
    name: 'PharmacyList',
    component: PharmacyList
  },
  {
    path: '/ck',
    name: 'CheckoutNow',
    component: CheckoutNow
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
