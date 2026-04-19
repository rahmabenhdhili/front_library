<template>
  <div class="page">
    <Navbar />

    <!-- Section héro avec l'image en fond -->
    <section class="hero">
      <div class="contenu">
        <h1>Votre Prochaine Grande <span class="accent">Histoire</span> Vous Attend</h1>
        <p>Explorez. Lisez. Grandissez. Tout en un seul endroit.</p>

        <!-- Barre de recherche -->
        <div class="recherche">
          <input type="text" placeholder="Rechercher des livres, auteurs, genres..." />
          <button>🔍 Rechercher</button>
        </div>

        <!-- Fonctionnalités -->
        <div class="fonctionnalites">
          <div class="carte">
            <span>📖</span>
            <strong>Découvrir des Livres</strong>
            <small>Explorez des histoires sans fin</small>
          </div>
          <div class="carte">
            <span>⭐</span>
            <strong>Vos Favoris</strong>
            <small>Sauvegardez et revisitez</small>
          </div>
          <div class="carte">
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
import Navbar from '../components/Navbar.vue'
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
  padding: 60px 20px;
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

/* Barre de recherche */
.recherche {
  display: flex;
  gap: 0;
  margin-bottom: 36px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.recherche input {
  flex: 1;
  padding: 14px 20px;
  border: none;
  font-size: 15px;
  outline: none;
}

.recherche button {
  padding: 14px 24px;
  background: #c0392b;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 15px;
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
