<template>
  <nav class="navbar">
    <!-- Logo -->
    <div class="logo">
      <span class="logo-icon">📚</span>
      <div>
        <strong>Librairie</strong>
        <small>Lire Plus · Vivre Plus</small>
      </div>
    </div>

    <!-- Liens -->
    <ul class="liens">
      <li><RouterLink to="/">Accueil</RouterLink></li>
    </ul>

    <!-- Boutons -->
    <div class="boutons">
      <template v-if="authStore.isLoggedIn">
        <button class="btn-connexion" @click="logout">
          Déconnexion
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login">
          <button class="btn-connexion">Connexion</button>
        </RouterLink>

        <RouterLink to="/inscription">
          <button class="btn-inscription">Inscription</button>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
}

.logo small {
  display: block;
  font-size: 11px;
  color: #888;
}

.logo-icon {
  font-size: 28px;
}

.liens {
  list-style: none;
  display: flex;
  gap: 28px;
  margin: 0;
  padding: 0;
}

.liens a {
  text-decoration: none;
  color: #333;
  font-size: 15px;
}

.liens a:hover {
  color: #c0392b;
}

.boutons {
  display: flex;
  gap: 12px;
}

.btn-connexion {
  padding: 8px 20px;
  border: 1px solid #ccc;
  border-radius: 20px;
  background: white;
  cursor: pointer;
}

.btn-inscription {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background: #c0392b;
  color: white;
  cursor: pointer;
}
</style>