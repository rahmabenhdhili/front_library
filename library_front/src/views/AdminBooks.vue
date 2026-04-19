<template>
  <div>
    <NavbarConnected />

    <!--
      PAGE ADMIN BOOKS — Gestion des livres
      =============================================
      Cette page est accessible après connexion (rôle: admin)
      Elle doit permettre de gérer les livres.

      API disponible (token JWT requis dans le header) :
        POST   /api/books/new        → ajouter un livre
        PUT    /api/books/edit/:id   → modifier un livre
        DELETE /api/books/delete/:id → supprimer un livre

      Pour envoyer le token :
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    -->

    <div class="page-container">
      <h1>Administration des Livres</h1>
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
