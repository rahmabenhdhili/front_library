import { createRouter, createWebHistory } from 'vue-router'

import Accueil from '../views/Accueil.vue'
import Login from '../views/Login.vue'
import Inscription from '../views/Inscription.vue'
import AllBooks from '../views/AllBooks.vue'
import AdminBooks from '../views/AdminBooks.vue'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Accueil },
    { path: '/login', component: Login },
    { path: '/inscription', component: Inscription },
    { path: '/books', component: AllBooks, meta: { requiresAuth: true } },
    { path: '/admin/books', component: AdminBooks, meta: { requiresAuth: true, adminOnly: true } },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return '/login'
  }

  if (to.meta.adminOnly && authStore.role !== 'admin') {
    return '/books'
  }
})

export default router
