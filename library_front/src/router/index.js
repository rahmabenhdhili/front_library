import { createRouter, createWebHistory } from 'vue-router'

import Accueil from '../views/Accueil.vue'
import Login from '../views/Login.vue'
import Inscription from '../views/Inscription.vue'
import Boutique from '../views/Boutique.vue'
import Admin from '../views/Admin.vue'

import { useAuthStore } from '../stores/auth' // ✅ ADD THIS

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Accueil },
    { path: '/login', component: Login },
    { path: '/inscription', component: Inscription },
    { path: '/boutique', component: Boutique, meta: { requiresAuth: true } },
    { path: '/admin', component: Admin, meta: { requiresAuth: true, adminOnly: true } },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore() // ✅ USE STORE

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }

  if (to.meta.adminOnly && authStore.role !== 'admin') {
    return '/boutique'
  }
})

export default router