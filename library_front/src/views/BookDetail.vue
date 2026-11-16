<template>
  <div>
    <NavbarConnected />

    <div class="book-detail-page">

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="book" class="detail-container">

        <!-- Section infos du livre -->
        <div class="book-info">
          <div class="book-cover">
            <img
              :src="book.image || 'https://placehold.co/200x300/EDE4D3/8A7F6E?text=No+Image'"
              :alt="book.title"
              @error="handleImageError"
            />
          </div>

          <div class="book-meta">
            <h1>{{ book.title }}</h1>
            <p class="author">
              <i class="bi bi-person"></i>
              {{ book.author?.prenom }} {{ book.author?.nom }}
            </p>
            <p class="editor">
              <i class="bi bi-building"></i>
              {{ book.editor }}
            </p>
            <p class="year">
              <i class="bi bi-calendar"></i>
              {{ book.year }}
            </p>

            <div class="actions">
              <button
                class="btn-favorite"
                :class="{ active: isFavorite }"
                @click="toggleFavorite"
              >
                <i :class="isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                {{ isFavorite ? 'Favori' : 'Ajouter aux favoris' }}
              </button>

              <button
                v-if="book.pdfUrl"
                class="btn-read"
                @click="showReader = !showReader"
              >
                <i class="bi bi-book-fill"></i>
                {{ showReader ? 'Fermer' : 'Lire le livre' }}
              </button>

              <p v-else class="no-pdf">
                <i class="bi bi-info-circle"></i>
                Lecture non disponible pour ce livre
              </p>
            </div>
          </div>
        </div>

        <!-- Section lecture PDF -->
        <div v-if="showReader && book.pdfUrl" class="pdf-reader">
          <iframe
            :src="book.pdfUrl"
            width="100%"
            height="700px"
            frameborder="0"
          ></iframe>
        </div>

      </div>

      <div v-else class="not-found">
        <i class="bi bi-emoji-frown"></i>
        <h3>Livre introuvable</h3>
        <router-link to="/books">Retour aux livres</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavbarConnected from '@/components/NavbarConnected.vue'
import api from '@/services/api'

const route = useRoute()
const book = ref(null)
const loading = ref(false)
const showReader = ref(false)
const isFavorite = ref(false)

async function loadBook() {
  loading.value = true
  try {
    const data = await api.getBookById(route.params.id)
    book.value = Array.isArray(data) ? data[0] : data

    // vérifier si c'est déjà un favori
    const favs = await api.getMyFavorites()
    const favIds = new Set((Array.isArray(favs) ? favs : []).map(b => b.id))
    isFavorite.value = favIds.has(book.value?.id)
  } catch (err) {
    console.error('Erreur chargement livre:', err)
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  try {
    if (isFavorite.value) {
      await api.removeFavorite(book.value.id)
    } else {
      await api.addFavorite(book.value.id)
    }
    isFavorite.value = !isFavorite.value
  } catch (err) {
    console.error('Erreur favori:', err)
  }
}

function handleImageError(e) {
  e.target.src = 'https://placehold.co/200x300/EDE4D3/8A7F6E?text=No+Image'
}

onMounted(loadBook)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

* { font-family: 'Inter', sans-serif; }

.book-detail-page {
  padding-top: 90px;
  padding-left: 2rem;
  padding-right: 2rem;
  min-height: 100vh;
  background: #FDFAF5;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.book-info {
  display: flex;
  gap: 2.5rem;
  margin-bottom: 2rem;
  background: white;
  border: 1px solid #EDE4D3;
  border-radius: 20px;
  padding: 2rem;
}

.book-cover img {
  width: 180px;
  height: 260px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(31,27,22,0.15);
}

.book-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.book-meta h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1F1B16;
  margin: 0;
}

.author, .editor, .year {
  font-size: 0.95rem;
  color: #5F564A;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author i, .editor i, .year i {
  color: #2F5D4F;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.btn-favorite, .btn-read {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-favorite {
  background: white;
  border: 1.5px solid #EDE4D3;
  color: #5F564A;
}

.btn-favorite.active {
  background: #B7411C;
  border-color: #B7411C;
  color: white;
}

.btn-favorite:hover {
  border-color: #B7411C;
  color: #B7411C;
}

.btn-favorite.active:hover {
  background: #9A3415;
  color: white;
}

.btn-read {
  background: #2F5D4F;
  color: white;
}

.btn-read:hover {
  background: #234538;
}

.no-pdf {
  font-size: 0.8rem;
  color: #8A7F6E;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pdf-reader {
  background: white;
  border: 1px solid #EDE4D3;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.loading-state, .not-found {
  text-align: center;
  padding: 4rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid #EDE4D3;
  border-top-color: #2F5D4F;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

.not-found i {
  font-size: 3rem;
  color: #DDD1BA;
  display: block;
  margin-bottom: 1rem;
}

.not-found h3 {
  color: #1F1B16;
  margin-bottom: 0.5rem;
}

.not-found a {
  color: #2F5D4F;
  font-size: 0.9rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .book-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .author, .editor, .year {
    justify-content: center;
  }
  .actions {
    justify-content: center;
  }
}
</style>
