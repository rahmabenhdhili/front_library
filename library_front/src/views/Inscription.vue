<template>
  <div class="page">
    <div class="carte">
      <h2>Inscription</h2>

      <input v-model="form.username" placeholder="Nom d'utilisateur" />
      <input v-model="form.email" type="email" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Mot de passe" />

      <p v-if="erreur" class="erreur">{{ erreur }}</p>
      <p v-if="succes" class="succes">Compte créé ! <RouterLink to="/login">Se connecter</RouterLink></p>

      <button @click="sInscrire">S'inscrire</button>

      <p v-if="!succes">Déjà un compte ? <RouterLink to="/login">Se connecter</RouterLink></p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { signup } from '../services/auth.js'

const erreur = ref('')
const succes = ref(false)
const form = ref({ username: '', email: '', password: '' })

async function sInscrire() {
  erreur.value = ''
  succes.value = false
  const result = await signup(form.value)
  if (result.id) {
    succes.value = true
  } else {
    erreur.value = result.message || 'Erreur lors de l\'inscription'
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

.erreur { color: #c0392b; font-size: 13px; text-align: center; }
.succes { color: green; font-size: 13px; text-align: center; }

p {
  text-align: center;
  font-size: 13px;
  color: #666;
}

a { color: #c0392b; }
</style>
