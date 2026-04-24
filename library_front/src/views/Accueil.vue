<template>
  <div class="page">
    <Navbar />

    <!-- Section héro avec l'image en fond -->
    <section class="hero">
      <div class="contenu">
        <h1>Votre Prochaine Grande <span class="accent">Histoire</span> Vous Attend</h1>
        <p>Explorez. Lisez. Grandissez. Tout en un seul endroit.</p>



        <!-- Fonctionnalités -->
        <div class="fonctionnalites">
<div class="carte" @click="router.push('/books')">
  <span>📖</span>
  <strong>Découvrir des Livres</strong>
  <small>Explorez des histoires sans fin</small>
</div>

<div class="carte" @click="router.push('/favorites')">
  <span>⭐</span>
  <strong>Vos Favoris</strong>
  <small>Sauvegardez et revisitez</small>
</div>

<div class="carte" @click="router.push('/inscription')">
  <span>👥</span>
  <strong>Rejoindre la Communauté</strong>
  <small>Partagez votre amour de la lecture</small>
</div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup>

import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
const router = useRouter()


function goToBooks() {
  router.push('/books')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* Image de fond */
.hero {
  min-height: calc(100vh - 70px);
  background-image: url('/bg.png');
  background-size: cover;
  background-position: bottom center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
}

.contenu {
  max-width: 600px;
}

h1 {
  font-size: 42px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.2;
  margin-bottom: 14px;
}

.accent {
  color: #c0392b;
}

p {
  color: #555;
  font-size: 16px;
  margin-bottom: 28px;
}



/* Cartes fonctionnalités */
.fonctionnalites {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.carte {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(255,255,255,0.85);
  padding: 14px 18px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  cursor: pointer;
}


.carte span {
  font-size: 22px;
}

.carte strong {
  font-size: 14px;
  color: #1a1a1a;
}

.carte small {
  font-size: 12px;
  color: #777;
}
</style>
