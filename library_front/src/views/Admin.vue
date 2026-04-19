<template>
  <div>
    <Navbar />

    <!--
      =============================================
      PAGE ADMIN — teba3 rania
      =============================================
      Cette page est accessible après connexion (rôle: admin)
      Elle doit permettre de gérer les livres.

nsaya7 men chat : 
      API disponible (token JWT requis dans le header) :
        POST   /api/books/new        → ajouter un livre
        PUT    /api/books/edit/:id   → modifier un livre
        DELETE /api/books/delete/:id → supprimer un livre

      Pour envoyer le token :
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    -->

    <h1>Espace Admin — à compléter</h1>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>
