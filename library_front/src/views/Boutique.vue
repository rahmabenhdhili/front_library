<template>
  <div>
    <Navbar />

    <!-- hethi el bookshop
      PAGE BOUTIQUE — teb3a rania
      =============================================
      Cette page est accessible après connexion (rôle: user)
      Elle doit afficher les livres de la bibliothèque.
hethom nsaya7 men chat : 
      API disponible :
        GET /api/books/all         → tous les livres
        GET /api/books/search/:id  → un livre par id (token requis)

      Exemple pour récupérer les livres :
        const res = await fetch('/api/books/all')
        const livres = await res.json()
    -->

    <h1>Boutique — à compléter</h1>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>
