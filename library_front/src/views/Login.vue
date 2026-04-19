<template>
  <div class="page">
    <div class="carte">
      <h2>Connexion</h2>

      <input v-model="form.identifiant" placeholder="Email ou nom d'utilisateur" />
      <input v-model="form.password" type="password" placeholder="Mot de passe" />

      <p v-if="erreur" class="erreur">{{ erreur }}</p>

      <button @click="seConnecter">Se connecter</button>

      <p>Pas de compte ? <RouterLink to="/inscription">S'inscrire</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signin } from '../services/auth.js'
import { useAuthStore } from '../stores/auth' // ✅ STORE

const router = useRouter()
const authStore = useAuthStore()

const erreur = ref('')
const form = ref({ identifiant: '', password: '' })

async function seConnecter() {
  erreur.value = ''

  try {
    const result = await signin(form.value)

    if (result.access_token) {
      // ✅ Save in store (and localStorage)
      authStore.login(result.access_token, result.role)

      // ✅ Redirect
      if (result.role === 'admin') {
        router.push('/admin/books')
      } else {
        router.push('/books')
      }
    } else {
      erreur.value = result.message || 'Identifiant ou mot de passe incorrect'
    }
  } catch (e) {
    erreur.value = 'Erreur serveur'
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdf6f0;
}

.carte {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 340px;
}

h2 {
  text-align: center;
  color: #1a1a1a;
}

input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

input:focus {
  border-color: #c0392b;
}

button {
  padding: 12px;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
}

.erreur {
  color: #c0392b;
  font-size: 13px;
  text-align: center;
}

p {
  text-align: center;
  font-size: 13px;
  color: #666;
}

a {
  color: #c0392b;
}
</style>
