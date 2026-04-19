<template>
  <div>
    <NavbarConnected />

    <!--
      PAGE ALL BOOKS — Librairie
      =============================================
      Cette page est accessible après connexion (rôle: user)
      Elle doit afficher tous les livres de la bibliothèque.

      API disponible :
        GET /api/books/all         → tous les livres
        GET /api/books/search/:id  → un livre par id (token requis)

      Exemple pour récupérer les livres :
        const res = await fetch('/api/books/all')
        const livres = await res.json()
    -->

    <div class="page-container">
      <h1>Tous les Livres</h1>
      <!-- Contenu à compléter -->
    </div>
  </div>
</template>

<script setup>
import NavbarConnected from '../components/NavbarConnected.vue'
</script>

<style scoped>
.page-container {
  padding-top: 90px; /* Pour compenser la navbar fixed */
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
