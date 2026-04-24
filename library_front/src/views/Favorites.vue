<template>
  <div>
    <NavbarConnected />
    <div class="favorites-page">
      <div class="favorites-header">
        <h1><i class="bi bi-heart-fill"></i> Mes Favoris</h1>
        <p class="subtitle">{{ favorites.length }} livre(s) dans vos favoris</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="favorites.length === 0" class="empty-state">
        <i class="bi bi-heart"></i>
        <h3>Aucun favori pour l'instant</h3>
        <p>Ajoutez des livres depuis la liste</p>
        <router-link to="/books" class="btn-browse">Parcourir les livres</router-link>
      </div>

      <div v-else class="books-grid">
        <div class="book-card" v-for="book in favorites" :key="book.id">
          <div class="book-image">
            <img
              :src="book.image || 'https://placehold.co/140x200/EDE4D3/8A7F6E?text=No+Image'"
              :alt="book.title"
              @error="handleImageError"
            />
            <div class="book-year">{{ book.year }}</div>
          </div>
          <div class="book-editor">{{ book.editor }}</div>
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-footer">
            <button class="btn-remove" @click="removeFavorite(book)">
              <i class="bi bi-heart-fill"></i> Retirer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavbarConnected from '@/components/NavbarConnected.vue'
import api from '@/services/api'

const favorites = ref([])
const loading = ref(false)

async function loadFavorites() {
  loading.value = true
  try {
    const data = await api.getMyFavorites()
    favorites.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Erreur chargement favoris:', err)
  } finally {
    loading.value = false
  }
}

async function removeFavorite(book) {
  try {
    await api.removeFavorite(book.id)
    favorites.value = favorites.value.filter(b => b.id !== book.id)
  } catch (err) {
    console.error('Erreur suppression favori:', err)
  }
}

function handleImageError(e) {
  e.target.src = 'https://placehold.co/140x200/EDE4D3/8A7F6E?text=No+Image'
}

onMounted(loadFavorites)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

* { font-family: 'Inter', sans-serif; }

.favorites-page {
  padding-top: 90px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  min-height: 100vh;
  background: #FDFAF5;
}

.favorites-header { max-width: 1200px; margin: 0 auto 2rem auto; }
.favorites-header h1 { font-size: 1.8rem; font-weight: 700; color: #1F1B16; }
.favorites-header h1 i { color: #B7411C; margin-right: 0.5rem; }
.subtitle { color: #8A7F6E; font-size: 0.9rem; margin-top: 0.25rem; }

.books-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background: #fff;
  border: 1px solid #EDE4D3;
  border-radius: 16px;
  padding: 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.book-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(31,27,22,0.15); }

.book-image {
  width: 100%;
  aspect-ratio: 2/3;
  max-width: 140px;
  margin: 0 auto 1rem auto;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(31,27,22,0.12);
}

.book-image img { width: 100%; height: 100%; object-fit: cover; }

.book-year {
  position: absolute;
  bottom: 8px; right: 8px;
  background: rgba(31,27,22,0.82);
  color: #FDFAF5;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.book-editor { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: #2F5D4F; text-align: center; margin-bottom: 0.4rem; }
.book-title { font-size: 1rem; font-weight: 600; color: #1F1B16; text-align: center; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.book-footer { margin-top: auto; display: flex; justify-content: center; }

.btn-remove {
  display: flex; align-items: center; gap: 0.4rem;
  background: #B7411C; border: none; color: white;
  padding: 0.5rem 1.1rem; border-radius: 999px;
  font-size: 0.75rem; font-weight: 500; cursor: pointer;
  transition: background 0.2s ease;
}

.btn-remove:hover { background: #9A3415; }

.loading-state, .empty-state { text-align: center; padding: 4rem; max-width: 1200px; margin: 0 auto; }

.loading-spinner {
  width: 40px; height: 40px;
  border: 2px solid #EDE4D3; border-top-color: #2F5D4F;
  border-radius: 50%; margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

.empty-state i { font-size: 3rem; color: #DDD1BA; display: block; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.25rem; color: #1F1B16; margin-bottom: 0.5rem; }
.empty-state p { color: #8A7F6E; margin-bottom: 1.5rem; }

.btn-browse {
  display: inline-block; padding: 0.6rem 1.5rem;
  background: #2F5D4F; color: white; border-radius: 999px;
  text-decoration: none; font-size: 0.85rem; font-weight: 500;
}

.btn-browse:hover { background: #234538; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
