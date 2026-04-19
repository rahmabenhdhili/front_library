<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <router-link to="/" class="logo-link">
          <div class="logo-icon">
            <i class="bi bi-journal-bookmark-fill"></i>
          </div>
          <span class="logo-text">Librairie</span>
        </router-link>
      </div>

      <div class="nav-menu">
        <router-link to="/books" class="nav-link" :class="{ active: isActive('/books') }">
          <i class="bi bi-book-fill"></i>
          <span>Livres</span>
        </router-link>

        <router-link to="/favorites" class="nav-link" :class="{ active: isActive('/favorites') }">
          <i class="bi bi-heart-fill"></i>
          <span>Favoris</span>
        </router-link>

        <router-link
          v-if="authStore.role === 'admin'"
          to="/admin/books"
          class="nav-link"
          :class="{ active: $route.path.startsWith('/admin') }"
        >
          <i class="bi bi-shield-check"></i>
          <span>Admin</span>
        </router-link>
      </div>

      <div class="nav-auth">
        <div class="user-menu">
          <button class="user-avatar" @click="toggleUserMenu">
            <div class="avatar-initials">
              {{ userInitials }}
            </div>
            <span class="user-name">{{ userName }}</span>
            <i class="bi bi-chevron-down" :class="{ rotated: isUserMenuOpen }"></i>
          </button>
          <Transition name="dropdown">
            <div v-if="isUserMenuOpen" class="user-dropdown">
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  {{ userInitials }}
                </div>
                <div>
                  <div class="dropdown-name">{{ userName }}</div>
                  <div class="dropdown-email">{{ userEmail }}</div>
                  <div class="dropdown-role">{{ userRole }}</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <a href="#" @click.prevent="handleLogout" class="dropdown-item logout">
                <i class="bi bi-box-arrow-right"></i>
                <span>Déconnexion</span>
              </a>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getTokenData } from '../services/token'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isUserMenuOpen = ref(false)

// Récupérer les données du token
const tokenData = computed(() => {
  if (!authStore.token) return null
  return getTokenData()
})

const userName = computed(() => {
  if (!tokenData.value) return 'Utilisateur'
  return tokenData.value.username || tokenData.value.email?.split('@')[0] || 'Utilisateur'
})

const userEmail = computed(() => {
  return tokenData.value?.email || ''
})

const userRole = computed(() => {
  const role = authStore.role
  if (role === 'admin') return 'Administrateur'
  if (role === 'user') return 'Utilisateur'
  return role || ''
})

const userInitials = computed(() => {
  const name = userName.value
  if (name === 'Utilisateur') return 'U'
  return name.slice(0, 2).toUpperCase()
})

const closeMenu = (e) => {
  if (!e.target.closest('.user-menu')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function handleLogout() {
  authStore.logout()
  isUserMenuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

* {
  font-family: 'Inter', sans-serif;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e8dccc;
  box-shadow: 0 2px 12px rgba(80, 55, 35, 0.08);
  height: 70px;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

/* Logo */
.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #c0392b, #a93226, #922b21);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(192, 57, 43, 0.2);
}

.logo-icon i {
  color: white;
  font-size: 1.25rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #c0392b, #a93226, #922b21);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 245, 245, 0.5);
  padding: 0.25rem;
  border-radius: 60px;
  backdrop-filter: blur(4px);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 40px;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.nav-link i {
  font-size: 1rem;
  color: #888;
}

.nav-link:hover {
  background: rgba(192, 57, 43, 0.08);
  color: #c0392b;
  transform: translateY(-1px);
}

.nav-link:hover i {
  color: #c0392b;
}

.nav-link.active {
  background: linear-gradient(135deg, #fdf8f0, #fdf2f0);
  color: #c0392b;
  box-shadow: 0 2px 8px rgba(192, 57, 43, 0.1);
  border-bottom: 2px solid #c0392b;
}

.nav-link.active i {
  color: #c0392b;
}

/* User menu */
.user-avatar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  background: rgba(245, 245, 245, 0.6);
  border: 1px solid #e0e0e0;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: rgba(245, 245, 245, 0.9);
  transform: translateY(-1px);
  border-color: #c0392b;
}

.avatar-initials {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #c0392b, #a93226);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 6px rgba(192, 57, 43, 0.15);
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
}

.user-avatar i:last-child {
  color: #888;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.user-avatar i:last-child.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: white;
  border-radius: 20px;
  min-width: 280px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  border: 1px solid #e8dccc;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(245, 245, 245, 0.5);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #c0392b, #a93226);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.dropdown-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.dropdown-email {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 0.125rem;
}

.dropdown-role {
  font-size: 0.7rem;
  color: #c0392b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-divider {
  height: 1px;
  background: #e8dccc;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #555;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(245, 245, 245, 0.5);
}

.dropdown-item.logout {
  color: #c0392b;
}

.dropdown-item.logout i {
  color: #c0392b;
}

.dropdown-item.logout:hover {
  background: rgba(192, 57, 43, 0.08);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 1rem;
  }
  .nav-link span {
    display: none;
  }
  .nav-link {
    padding: 0.5rem 1rem;
  }
  .nav-link i {
    font-size: 1.25rem;
  }
  .user-name {
    display: none;
  }
  .user-avatar {
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }
  .logo-text {
    display: none;
  }
  .nav-menu {
    gap: 0.125rem;
  }
  .nav-link {
    padding: 0.4rem 0.75rem;
  }
}
</style>
