<template>
  <div>
    <NavbarConnected />

    <div class="all-books">

      <div class="filters-section">
        <div class="filters-container">

          <div class="filter-group filter-search">
            <label>
              <i class="bi bi-search"></i>
              Rechercher
            </label>
            <input
              type="text"
              v-model="filters.title"
              placeholder="Titre ou auteur..."
              class="filter-input"
              @input="applyFilters"
            />
          </div>


          <div class="filter-group filter-year">
            <label>
              <i class="bi bi-calendar"></i>
              Année début
            </label>
            <select
              v-model="filters.startYear"
              class="filter-input filter-select"
              @change="applyFilters"
            >
              <option value="">Toutes</option>
              <option v-for="year in allYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>


          <div class="filter-group filter-year">
            <label>
              <i class="bi bi-calendar"></i>
              Année fin
            </label>
            <select
              v-model="filters.endYear"
              class="filter-input filter-select"
              @change="applyFilters"
            >
              <option value="">Toutes</option>
              <option v-for="year in allYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="filter-actions">
            <button class="btn-clear" @click="clearFilters">
              <i class="bi bi-x-circle"></i> Effacer
            </button>
          </div>
        </div>


        <div class="filter-results-wrapper" v-if="filteredBooks.length !== books.length">
          <div class="filter-results">
            <i class="bi bi-info-circle"></i>
            {{ filteredBooks.length }} livre(s) trouvé(s) sur {{ books.length }}
          </div>
        </div>
      </div>


      <div class="books-section">

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement des livres...</p>
        </div>


        <div v-else-if="filteredBooks.length > 0" class="books-grid">
          <div
            class="book-card"
            :class="{ featured: book.isFavorite }"
            v-for="book in filteredBooks"
            :key="book.id"
          >
            <div class="book-image">
              <img
                :src="book.image || 'https://placehold.co/140x200/EDE4D3/8A7F6E?text=No+Image'"
                :alt="book.title"
                class="book-cover"
                @error="handleImageError"
              />
              <div class="book-year">{{ book.year }}</div>
              <div v-if="book.isFavorite" class="favorite-badge">
                <i class="bi bi-heart-fill"></i>
              </div>
            </div>
            <div class="book-category">{{ book.editor || 'Éditeur inconnu' }}</div>
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">
              {{ book.author?.prenom }} {{ book.author?.nom }}
              <span v-if="!book.author?.prenom && !book.author?.nom">Auteur inconnu</span>
            </p>
            <div class="book-footer">
              <button
                class="favorite-btn"
                :class="{ active: book.isFavorite }"
                @click.stop="toggleFavorite(book)"
              >
                <i :class="book.isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                <span>{{ book.isFavorite ? 'Favori' : 'Ajouter' }}</span>
              </button>
            </div>
          </div>
        </div>


        <div v-else class="no-results">
          <i class="bi bi-emoji-frown"></i>
          <h3>Aucun livre trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import NavbarConnected from '@/components/NavbarConnected.vue'
import api from '@/services/api'


const books = ref([])
const authors = ref([])
const loading = ref(false)
const favorites = ref(new Set())
let isFirstLoad = true

// Charger les livres depuis l'API
async function loadBooks() {
  loading.value = true
  try {
    const [booksData, authorsData, favsData] = await Promise.all([
      api.getAllBooks(),
      api.getAllAuthors(),
      api.getMyFavorites()
    ])

    const favIds = new Set((Array.isArray(favsData) ? favsData : []).map(b => b.id))
    favorites.value = favIds

    authors.value = Array.isArray(authorsData) ? authorsData : []

    let processedBooks = Array.isArray(booksData) ? booksData : []

    processedBooks = processedBooks.map(book => {
      if (book.author && typeof book.author === 'object') {
        return { ...book, isFavorite: favorites.value.has(book.id) }
      }

      const authorId = book.author?.id || book.author
      const foundAuthor = authors.value.find(a => a.id === authorId)

      return {
        ...book,
        author: foundAuthor || null,
        isFavorite: favIds.has(book.id)
      }
    })

    books.value = processedBooks
    applyFilters()
  } catch (error) {
    console.error('Erreur chargement livres:', error)
    books.value = []
  } finally {
    loading.value = false
  }
}

const allYears = computed(() => {
  const years = new Set()
  books.value.forEach(book => {
    if (book.year) years.add(parseInt(book.year))
  })
  return Array.from(years).sort((a, b) => b - a)
})

const filters = ref({ title: '', startYear: '', endYear: '' })
const filteredBooks = ref([])

function applyFilters() {
  let result = [...books.value]

  if (filters.value.title.trim()) {
    const searchTerm = filters.value.title.trim().toLowerCase()
    result = result.filter(book => {
      const titleMatch = book.title?.toLowerCase().includes(searchTerm)
      const authorName = `${book.author?.prenom || ''} ${book.author?.nom || ''}`.toLowerCase()
      const authorMatch = authorName.includes(searchTerm)
      const editorMatch = book.editor?.toLowerCase().includes(searchTerm)
      return titleMatch || authorMatch || editorMatch
    })
  }

  if (filters.value.startYear) {
    result = result.filter(book => parseInt(book.year) >= parseInt(filters.value.startYear))
  }

  if (filters.value.endYear) {
    result = result.filter(book => parseInt(book.year) <= parseInt(filters.value.endYear))
  }

  filteredBooks.value = result
}

function clearFilters() {
  filters.value = { title: '', startYear: '', endYear: '' }
  applyFilters()
}

async function toggleFavorite(book) {
  try {
    if (favorites.value.has(book.id)) {
      await api.removeFavorite(book.id)
      favorites.value.delete(book.id)
    } else {
      await api.addFavorite(book.id)
      favorites.value.add(book.id)
    }
    books.value = books.value.map(b => ({
      ...b,
      isFavorite: favorites.value.has(b.id)
    }))
    applyFilters()
  } catch (error) {
    console.error('Erreur favori:', error)
  }
}


function handleImageError(e) {
  e.target.src = 'https://placehold.co/140x200/EDE4D3/8A7F6E?text=No+Image'
}

onMounted(() => {
  loadBooks()
  isFirstLoad = false
})

onActivated(() => {
  if (!isFirstLoad) loadBooks()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');


.all-books {
  --bs-bg-main: #FDFAF5;
  --bs-bg-card: #FFFFFF;
  --bs-bg-soft: #F6EFE2;

  --bs-accent: #B7411C;
  --bs-accent-hover: #9A3415;
  --bs-accent-soft: #FBEDE5;

  --bs-secondary: #2F5D4F;
  --bs-secondary-hover: #234538;
  --bs-secondary-soft: #E3EDE5;

  --bs-text-primary: #1F1B16;
  --bs-text-secondary: #5F564A;
  --bs-text-muted: #8A7F6E;
  --bs-text-placeholder: #B0A596;

  --bs-border: #EDE4D3;
  --bs-border-strong: #DDD1BA;
}

* {
  font-family: 'Inter', sans-serif;
}

.all-books {
  height: calc(100vh - 70px);
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bs-bg-main);
  background-image: url('/public/images/bookadmin.jpeg');
  background-repeat: repeat;
}

/* ========== SECTION FILTRES ========== */
.filters-section {
  flex-shrink: 0;
  padding: 1.25rem 1.5rem 1rem 1.5rem;
  background: rgba(253, 250, 245, 0.55);
  backdrop-filter: blur(60px);
  border-bottom: 1px solid var(--bs-border);
}

.filters-container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: end;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bs-text-secondary);
  margin-bottom: 0.35rem;
  height: 16px;
}

.filter-group label i {
  color: var(--bs-secondary);
  font-size: 0.75rem;
}

.filter-input {
  width: 100%;
  height: 40px;
  padding: 0 0.85rem;
  font-size: 0.8rem;
  border: 1.5px solid var(--bs-border);
  border-radius: 10px;
  background: var(--bs-bg-card);
  color: var(--bs-text-primary);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.filter-select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A7F6E' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 10px;
  padding-right: 2rem;
}

.filter-input:focus {
  outline: none;
  border-color: var(--bs-secondary);
  box-shadow: 0 0 0 3px rgba(47, 93, 79, 0.12);
}

.filter-input::placeholder {
  color: var(--bs-text-placeholder);
  font-size: 0.75rem;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.btn-clear {
  height: 40px;
  padding: 0 1.1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1.5px solid var(--bs-border);
  background: var(--bs-bg-card);
  color: var(--bs-text-secondary);
  transition: all 0.2s ease;
  white-space: nowrap;
  box-sizing: border-box;
}

.btn-clear i {
  font-size: 0.9rem;
}

.btn-clear:hover {
  background: var(--bs-accent-soft);
  border-color: var(--bs-accent);
  color: var(--bs-accent);
  transform: translateY(-1px);
}

.filter-results-wrapper {
  max-width: 1100px;
  margin: 0.75rem auto 0 auto;
  display: flex;
  justify-content: flex-start;
}

.filter-results {
  padding: 0.4rem 0.9rem;
  background: var(--bs-secondary-soft);
  border-radius: 999px;
  font-size: 0.72rem;
  color: var(--bs-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}

.filter-results i {
  color: var(--bs-secondary);
  font-size: 0.75rem;
}

/* ========== SECTION LIVRES ========== */
.books-section {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
}

.books-section::-webkit-scrollbar {
  width: 6px;
}

.books-section::-webkit-scrollbar-track {
  background: var(--bs-bg-soft);
  border-radius: 10px;
}

.books-section::-webkit-scrollbar-thumb {
  background: var(--bs-border-strong);
  border-radius: 10px;
}

.books-section::-webkit-scrollbar-thumb:hover {
  background: var(--bs-text-muted);
}

/* ========== GRILLE DE LIVRES ========== */
.books-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* ========== CARTE DE LIVRE ========== */
.book-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid var(--bs-border);
  border-radius: 16px;
  padding: 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(31, 27, 22, 0.15);
  border-color: var(--bs-border-strong);
}

.book-card.featured {
  border-color: var(--bs-accent);
  background: rgba(255, 253, 250, 0.82);
}

.book-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 1.2rem;
  right: 1.2rem;
  height: 3px;
  background: var(--bs-accent);
  border-radius: 0 0 4px 4px;
}

.book-image {
  width: 100%;
  aspect-ratio: 2 / 3;
  max-width: 140px;
  margin: 0 auto 1rem auto;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(31, 27, 22, 0.12);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.book-year {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(31, 27, 22, 0.82);
  backdrop-filter: blur(4px);
  color: #FDFAF5;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.favorite-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--bs-accent);
  color: #FFFFFF;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  box-shadow: 0 2px 6px rgba(183, 65, 28, 0.35);
}

.book-category {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--bs-secondary);
  margin-bottom: 0.4rem;
  text-align: center;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin-bottom: 0.3rem;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 0.75rem;
  color: var(--bs-text-muted);
  text-align: center;
  margin-bottom: 1rem;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-footer {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bs-bg-card);
  border: 1.5px solid var(--bs-border);
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--bs-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn i {
  color: var(--bs-accent);
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.favorite-btn:hover {
  background: var(--bs-accent-soft);
  border-color: var(--bs-accent);
  color: var(--bs-accent);
}

.favorite-btn.active {
  background: var(--bs-accent);
  border-color: var(--bs-accent);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(183, 65, 28, 0.22);
}

.favorite-btn.active i {
  color: #FFFFFF;
}

.favorite-btn.active:hover {
  background: var(--bs-accent-hover);
  border-color: var(--bs-accent-hover);
}

/* ========== ÉTATS DE CHARGEMENT ========== */
.loading-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid var(--bs-border);
  border-top-color: var(--bs-secondary);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

.loading-state p {
  color: var(--bs-text-muted);
}

.no-results {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 3rem;
}

.no-results i {
  font-size: 3rem;
  color: var(--bs-border-strong);
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin-bottom: 0.5rem;
}

.no-results p {
  color: var(--bs-text-muted);
}

/* Animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 900px) {
  .filters-container {
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .filter-search {
    grid-column: 1 / -1;
  }

  .filter-actions {
    grid-column: 1 / -1;
  }

  .btn-clear {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .all-books {
    height: calc(100vh - 60px);
    top: 60px;
  }

  .filters-section {
    padding: 1rem;
  }

  .books-section {
    padding: 1rem;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .filters-container {
    grid-template-columns: 1fr;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
