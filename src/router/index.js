// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import PharmacyList from '../components/PharmacyList.vue'
import MedicineList from '../components/MedicineList.vue'
import CheckoutNow from '../components/CheckoutNow.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router