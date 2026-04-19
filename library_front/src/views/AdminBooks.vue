<template>
  <div>
    <NavbarConnected />

    <div class="admin-books">
      <!-- En-tête avec décoration -->
      <div class="admin-header">
        <div class="header-left">
          <div class="header-decoration">
            <i class="bi bi-flower1"></i>
            <i class="bi bi-journal-bookmark-fill"></i>
            <i class="bi bi-cup-straw"></i>
          </div>
          <h1>
            <i class="bi bi-journal-bookmark-fill"></i>
            Bibliothèque
          </h1>
          <p class="header-subtitle">Gérez votre collection de livres dans une ambiance chaleureuse</p>
        </div>
        <button class="btn-add" @click="openAddModal">
          <i class="bi bi-plus-lg"></i>
          Ajouter un livre
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="search-section">
        <div class="search-bar">
          <i class="bi bi-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un livre, auteur ou éditeur..."
            @input="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="stats-badge">
          <i class="bi bi-book"></i>
          <span>{{ filteredBooks.length }} livre(s)</span>
        </div>
      </div>

      <!-- Table des livres -->
      <div class="books-table-wrapper">
        <div class="books-table-container">
          <table class="books-table">
            <thead>
              <tr>
                <th></th>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Année</th>
                <th>Éditeur</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in paginatedBooks" :key="book.id">
                <td class="image-cell">
                  <div class="book-cover">
                    <img
                      :src="book.image || 'https://placehold.co/60x80/EDE4D3/8A7F6E?text=No+Image'"
                      :alt="book.title"
                      @error="handleImageError"
                    />
                  </div>
                </td>
                <td class="title-cell">
                  <span class="book-title">{{ book.title }}</span>
                </td>
                <td>
                  <div class="author-info">
                    <i class="bi bi-person"></i>
                    {{ book.author?.prenom }} {{ book.author?.nom }}
                    <span v-if="!book.author?.prenom && !book.author?.nom">N/A</span>
                  </div>
                </td>
                <td>
                  <span class="year-badge">{{ book.year }}</span>
                </td>
                <td>
                  <span class="editor-text">{{ book.editor }}</span>
                </td>
                <td class="actions-cell">
                  <div class="actions-wrapper">
                    <button class="btn-icon btn-edit" @click="openEditModal(book)" title="Modifier">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-icon btn-delete" @click="confirmDelete(book)" title="Supprimer">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="loadingBooks" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Chargement des livres...</p>
          </div>

          <div v-else-if="filteredBooks.length === 0" class="no-books">
            <i class="bi bi-book"></i>
            <p>Aucun livre trouvé</p>
            <button class="btn-outline" @click="openAddModal">Ajouter un livre</button>
          </div>

          <!-- Pagination -->
          <div v-if="filteredBooks.length > 0" class="pagination-section">
            <div class="pagination-info">
              <span class="highlight">{{ startIndex + 1 }}-{{ endIndex }}</span> sur <span class="highlight">{{ filteredBooks.length }}</span> livres
            </div>
            <div class="pagination-controls">
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="goToPage(1)"
              >
                <i class="bi bi-chevron-double-left"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                <i class="bi bi-chevron-left"></i>
              </button>

              <div class="pagination-pages">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="pagination-page"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>

              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="goToPage(totalPages)"
              >
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </div>

            <div class="pagination-per-page">
              <select v-model="itemsPerPage" @change="resetPagination">
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="30">30 / page</option>
                <option :value="50">50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Ajout/Modification -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <div class="modal-icon" :class="{ edit: isEditing }">
                  <i v-if="isEditing" class="bi bi-pencil-square"></i>
                  <i v-else class="bi bi-journal-bookmark-fill"></i>
                </div>
                <h2>{{ isEditing ? 'Modifier le livre' : 'Nouveau livre' }}</h2>
                <button class="modal-close" @click="closeModal">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <form @submit.prevent="saveBook">
                <div class="modal-form-body">
                  <div class="form-grid">
                    <div class="form-group full-width">
                      <label>
                        <i class="bi bi-book"></i>
                        Titre
                      </label>
                      <input
                        type="text"
                        v-model="form.title"
                        required
                        maxlength="50"
                        placeholder="Le Petit Prince"
                      />
                      <span class="input-hint">{{ form.title.length }}/50 caractères</span>
                    </div>

                    <div class="form-group">
                      <label>
                        <i class="bi bi-person"></i>
                        Auteur
                      </label>
                      <div class="author-input-group">
                        <select
                          v-model="form.authorId"
                          v-if="!showNewAuthorForm"
                          required
                          class="author-select"
                        >
                          <option value="">Sélectionner un auteur</option>
                          <option v-for="author in authors" :key="author.id" :value="author.id">
                            {{ author.prenom }} {{ author.nom }}
                          </option>
                          <option value="new">+ Créer un nouvel auteur</option>
                        </select>

                        <div v-if="showNewAuthorForm" class="new-author-form">
                          <input
                            type="text"
                            v-model="form.newAuthorPrenom"
                            placeholder="Prénom"
                            required
                            class="author-input"
                          />
                          <input
                            type="text"
                            v-model="form.newAuthorNom"
                            placeholder="Nom"
                            required
                            class="author-input"
                          />
                          <button type="button" class="btn-cancel-author" @click="cancelNewAuthor">
                            <i class="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="form-group">
                      <label>
                        <i class="bi bi-calendar"></i>
                        Année
                      </label>
                      <input
                        type="number"
                        v-model="form.year"
                        required
                        min="1000"
                        :max="currentYear"
                        placeholder="2024"
                      />
                    </div>

                    <div class="form-group">
                      <label>
                        <i class="bi bi-building"></i>
                        Éditeur
                      </label>
                      <input
                        type="text"
                        v-model="form.editor"
                        required
                        placeholder="Gallimard"
                      />
                    </div>

                    <div class="form-group full-width">
                      <label>
                        <i class="bi bi-image"></i>
                        Image (URL)
                      </label>
                      <input
                        type="url"
                        v-model="form.image"
                        required
                        placeholder="https://..."
                        maxlength="20048"
                      />
                      <div v-if="form.image" class="image-preview">
                        <img :src="form.image" alt="Preview" @error="handleImageError" />
                        <span class="preview-label">Aperçu</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="errorMessage" class="error-message">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    {{ errorMessage }}
                  </div>
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-secondary" @click="closeModal" :disabled="loading">
                    Annuler
                  </button>
                  <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading" class="loading-dot"></span>
                    <template v-else>
                      <i v-if="isEditing" class="bi bi-check-lg"></i>
                      <i v-else class="bi bi-plus-lg"></i>
                      {{ isEditing ? 'Mettre à jour' : 'Ajouter' }}
                    </template>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Modal Confirmation Suppression -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
            <div class="modal-content delete-modal" @click.stop>
              <div class="modal-header">
                <div class="modal-icon warning">
                  <i class="bi bi-trash3"></i>
                </div>
                <h2>Confirmer la suppression</h2>
                <button class="modal-close" @click="closeDeleteModal">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <div class="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer</p>
                <div class="book-to-delete">
                  {{ bookToDelete?.title }}
                </div>
                <div class="warning-text">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  Cette action est irréversible
                </div>
              </div>

              <div class="modal-actions">
                <button class="btn-secondary" @click="closeDeleteModal" :disabled="loading">
                  Annuler
                </button>
                <button class="btn-danger" @click="deleteBook" :disabled="loading">
                  <span v-if="loading" class="loading-dot"></span>
                  <span v-else>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import NavbarConnected from '@/components/NavbarConnected.vue'
import api from '@/services/api'

// État
const books = ref([])
const authors = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const loading = ref(false)
const loadingBooks = ref(false)
const errorMessage = ref('')
const bookToDelete = ref(null)
const editingBookId = ref(null)
const showNewAuthorForm = ref(false)

// Pagination et recherche
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')

const currentYear = new Date().getFullYear()

// Formulaire
const form = ref({
  title: '',
  authorId: '',
  newAuthorPrenom: '',
  newAuthorNom: '',
  year: '',
  editor: '',
  image: ''
})

// Watch pour le formulaire d'auteur
watch(() => form.value.authorId, (newVal) => {
  if (newVal === 'new') {
    showNewAuthorForm.value = true
    form.value.authorId = ''
  }
})

// Filtrage des livres
const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) {
    return books.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return books.value.filter(book => {
    return (
      book.title?.toLowerCase().includes(query) ||
      `${book.author?.prenom || ''} ${book.author?.nom || ''}`.toLowerCase().includes(query) ||
      book.editor?.toLowerCase().includes(query) ||
      book.year?.toString().includes(query)
    )
  })
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredBooks.value.length / itemsPerPage.value) || 1
})

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBooks.value.slice(start, end)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredBooks.value.length)
})

const visiblePages = computed(() => {
  const maxVisible = 5
  const pages = []
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Méthodes de pagination
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function resetPagination() {
  currentPage.value = 1
}

function handleSearch() {
  resetPagination()
}

function clearSearch() {
  searchQuery.value = ''
  resetPagination()
}

// Chargement des données
async function loadBooks() {
  loadingBooks.value = true
  try {
    const [booksData, authorsData] = await Promise.all([
      api.getAllBooks(),
      api.getAllAuthors()
    ])

    books.value = Array.isArray(booksData) ? booksData : []
    authors.value = Array.isArray(authorsData) ? authorsData : []

    // Associer les auteurs aux livres
    books.value = books.value.map(book => {
      if (book.author && typeof book.author === 'object') {
        return book
      }
      const authorId = book.author?.id || book.author
      const foundAuthor = authors.value.find(a => a.id === authorId)
      return { ...book, author: foundAuthor || null }
    })

    resetPagination()
  } catch (error) {
    console.error('Erreur chargement livres:', error)
    errorMessage.value = 'Impossible de charger les livres'
    books.value = []
  } finally {
    loadingBooks.value = false
  }
}

async function loadAuthors() {
  try {
    const data = await api.getAllAuthors()
    authors.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erreur chargement auteurs:', error)
    authors.value = []
  }
}

// Gestion du modal
function openAddModal() {
  isEditing.value = false
  editingBookId.value = null
  showNewAuthorForm.value = false
  resetForm()
  showModal.value = true
  errorMessage.value = ''
}

function openEditModal(book) {
  isEditing.value = true
  editingBookId.value = book.id
  showNewAuthorForm.value = false

  form.value = {
    title: book.title || '',
    authorId: book.author?.id || '',
    newAuthorPrenom: '',
    newAuthorNom: '',
    year: book.year || '',
    editor: book.editor || '',
    image: book.image || ''
  }

  showModal.value = true
  errorMessage.value = ''
}

function closeModal() {
  showModal.value = false
  showNewAuthorForm.value = false
  resetForm()
}

function cancelNewAuthor() {
  showNewAuthorForm.value = false
  form.value.newAuthorPrenom = ''
  form.value.newAuthorNom = ''
  form.value.authorId = ''
}

function resetForm() {
  form.value = {
    title: '',
    authorId: '',
    newAuthorPrenom: '',
    newAuthorNom: '',
    year: '',
    editor: '',
    image: ''
  }
}

function handleImageError(e) {
  e.target.src = 'https://placehold.co/60x80/EDE4D3/8A7F6E?text=No+Image'
}

// Sauvegarde
async function saveBook() {
  loading.value = true
  errorMessage.value = ''

  try {
    let finalAuthorId = form.value.authorId

    // Créer un nouvel auteur si nécessaire
    if (showNewAuthorForm.value && form.value.newAuthorPrenom && form.value.newAuthorNom) {
      const newAuthor = await api.addAuthor({
        prenom: form.value.newAuthorPrenom.trim(),
        nom: form.value.newAuthorNom.trim()
      })
      finalAuthorId = newAuthor.id
    }

    const bookData = {
      title: form.value.title.trim().substring(0, 50),
      year: parseInt(form.value.year),
      editor: form.value.editor.trim(),
      image: form.value.image.trim(),
      author: finalAuthorId ? parseInt(finalAuthorId) : null
    }

    // Validation
    if (!bookData.title) throw new Error('Le titre est requis')
    if (!bookData.year || bookData.year < 1000 || bookData.year > currentYear) {
      throw new Error('Année invalide')
    }
    if (!bookData.editor) throw new Error('L\'éditeur est requis')
    if (!bookData.image) throw new Error('L\'URL de l\'image est requise')
    if (!bookData.author) throw new Error('L\'auteur est requis')

    if (isEditing.value) {
      await api.updateBook(editingBookId.value, bookData)
    } else {
      await api.addBook(bookData)
    }

    await loadBooks()
    await loadAuthors()
    closeModal()
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    errorMessage.value = error.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

// Suppression
function confirmDelete(book) {
  bookToDelete.value = book
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  bookToDelete.value = null
}

async function deleteBook() {
  if (!bookToDelete.value) return

  loading.value = true
  try {
    await api.deleteBook(bookToDelete.value.id)
    await loadBooks()
    closeDeleteModal()
  } catch (error) {
    console.error('Erreur suppression:', error)
    errorMessage.value = error.message || 'Erreur lors de la suppression'
  } finally {
    loading.value = false
  }
}

// Initialisation
onMounted(() => {
  loadBooks()
  loadAuthors()
})
</script>

<style>
:root {
  /* Fonds */
  --bs-bg-main: #FDFAF5;
  --bs-bg-card: #FFFFFF;
  --bs-bg-header: #F6EFE2;
  --bs-bg-soft: #F9F3E8;

  /* Accents */
  --bs-accent: #B7411C;
  --bs-accent-hover: #9A3415;
  --bs-accent-soft: #FBEDE5;
  --bs-accent-soft-hover: #F5DCD0;

  --bs-secondary: #2F5D4F;
  --bs-secondary-hover: #234538;
  --bs-secondary-soft: #E3EDE5;
  --bs-secondary-soft-hover: #CEE0D3;

  /* Textes */
  --bs-text-primary: #1F1B16;
  --bs-text-secondary: #5F564A;
  --bs-text-muted: #8A7F6E;
  --bs-text-placeholder: #B0A596;

  /* Bordures */
  --bs-border: #EDE4D3;
  --bs-border-strong: #DDD1BA;
}

/* ========== MODALS ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(31, 27, 22, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1rem;
}

.modal-content {
  background: var(--bs-bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(31, 27, 22, 0.18);
  border: 1px solid var(--bs-border);
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  position: relative;
  border-bottom: 1px solid var(--bs-border);
  background: var(--bs-bg-main);
}

.modal-icon {
  width: 44px;
  height: 44px;
  background: var(--bs-secondary-soft);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon i {
  font-size: 1.3rem;
  color: var(--bs-secondary);
}

.modal-icon.edit {
  background: var(--bs-secondary-soft);
}

.modal-icon.edit i {
  color: var(--bs-secondary);
}

.modal-icon.warning {
  background: var(--bs-accent-soft);
}

.modal-icon.warning i {
  color: var(--bs-accent);
}

.modal-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin: 0;
}

.modal-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--bs-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bs-border);
  color: var(--bs-text-primary);
}

.modal-content form {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.modal-form-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
}

.modal-form-body::-webkit-scrollbar {
  width: 5px;
}

.modal-form-body::-webkit-scrollbar-track {
  background: var(--bs-bg-header);
  border-radius: 10px;
}

.modal-form-body::-webkit-scrollbar-thumb {
  background: var(--bs-border-strong);
  border-radius: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bs-text-secondary);
}

.form-group label i {
  font-size: 0.8rem;
  color: var(--bs-secondary);
}

.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--bs-border);
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: var(--bs-bg-card);
  color: var(--bs-text-primary);
  min-width: 0;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--bs-secondary);
  box-shadow: 0 0 0 3px rgba(47, 93, 79, 0.12);
}

.form-group input::placeholder {
  color: var(--bs-text-placeholder);
}

.input-hint {
  font-size: 0.65rem;
  color: var(--bs-text-muted);
  text-align: right;
}

.author-input-group {
  width: 100%;
}

.new-author-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.new-author-form input {
  flex: 1;
  min-width: 0;
}

.btn-cancel-author {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1.5px solid var(--bs-border);
  background: var(--bs-bg-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--bs-text-muted);
}

.btn-cancel-author:hover {
  background: var(--bs-accent-soft);
  color: var(--bs-accent);
  border-color: var(--bs-accent-soft-hover);
}

.image-preview {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.image-preview img {
  max-width: 90px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--bs-border);
  box-shadow: 0 2px 6px rgba(31, 27, 22, 0.06);
}

.preview-label {
  font-size: 0.65rem;
  color: var(--bs-text-muted);
}

.error-message {
  margin-top: 1rem;
  padding: 0.7rem 1rem;
  background: var(--bs-accent-soft);
  border-radius: 10px;
  color: var(--bs-accent);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: 3px solid var(--bs-accent);
}

.modal-actions {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--bs-border);
  background: var(--bs-bg-main);
  border-radius: 0 0 20px 20px;
}

.btn-primary,
.btn-secondary {
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--bs-accent);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(183, 65, 28, 0.22);
}

.btn-primary:hover:not(:disabled) {
  background: var(--bs-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(183, 65, 28, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bs-bg-card);
  color: var(--bs-text-secondary);
  border: 1px solid var(--bs-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bs-bg-header);
  color: var(--bs-text-primary);
  border-color: var(--bs-border-strong);
}

.loading-dot {
  width: 14px;
  height: 14px;
  border: 2px solid #FFFFFF;
  border-top-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal suppression */
.modal-content.delete-modal {
  max-width: 400px;
}

.modal-content.delete-modal .modal-body {
  padding: 0.5rem 1.5rem 1rem;
  text-align: center;
}

.modal-content.delete-modal .modal-body p {
  font-size: 0.85rem;
  color: var(--bs-text-secondary);
  margin: 0 0 0.5rem 0;
}

.modal-content.delete-modal .book-to-delete {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin: 0.75rem 0;
  padding: 0.7rem 1rem;
  background: var(--bs-bg-header);
  border-radius: 10px;
  border-left: 3px solid var(--bs-accent);
}

.modal-content.delete-modal .warning-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  background: var(--bs-accent-soft);
  border-radius: 999px;
  font-size: 0.7rem;
  color: var(--bs-accent);
  margin-top: 0.75rem;
}

.modal-content.delete-modal .modal-actions {
  justify-content: center;
}

.modal-content.delete-modal .btn-danger {
  background: var(--bs-accent);
  color: #FFFFFF;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(183, 65, 28, 0.22);
}

.modal-content.delete-modal .btn-danger:hover:not(:disabled) {
  background: var(--bs-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(183, 65, 28, 0.3);
}

/* Animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .form-group.full-width {
    grid-column: span 1;
  }
  .modal-content {
    margin: 1rem;
  }
  .modal-header {
    padding: 1rem 1rem 0.25rem 1rem;
  }
  .modal-content form {
    padding: 1rem;
  }
  .new-author-form {
    flex-direction: column;
  }
  .new-author-form input {
    width: 100%;
  }
  .btn-cancel-author {
    width: 100%;
  }
  .modal-actions {
    flex-direction: column-reverse;
  }
  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

* {
  font-family: 'Inter', sans-serif;
}

.admin-books {
  height: calc(100vh - 70px);
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-image: url('/public/images/bookadmin.jpeg');
  background-repeat: repeat;
  background-blend-mode: overlay;
}

.admin-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  background: rgba(174, 151, 130, 0.55);
  backdrop-filter: blur(60px);
  border-bottom: 1px solid var(--bs-border);
}

.header-left {
  position: relative;
}

.header-decoration {
  position: absolute;
  top: -15px;
  left: -20px;
  display: flex;
  gap: 0.3rem;
  opacity: 0.35;
}

.header-decoration i {
  font-size: 0.8rem;
  color: var(--bs-secondary);
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header-left h1 i {
  color: var(--bs-secondary);
  font-size: 1.5rem;
}

.header-subtitle {
  color: var(--bs-text-muted);
  font-size: 0.8rem;
  margin: 0.2rem 0 0;
  font-style: italic;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  background: var(--bs-accent);
  color: #FFFFFF;
  border: none;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(183, 65, 28, 0.22);
}

.btn-add:hover {
  background: var(--bs-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(183, 65, 28, 0.32);
}

/* ========== RECHERCHE ========== */
.search-section {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background: rgba(174, 151, 130, 0.55);
  backdrop-filter: blur(60px);
  border-bottom: 1px solid var(--bs-border);
  gap: 1rem;
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 380px;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bs-text-muted);
  font-size: 0.9rem;
}

.search-bar input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 2.3rem;
  border: 1.5px solid var(--bs-border);
  border-radius: 999px;
  font-size: 0.85rem;
  transition: all 0.2s;
  background: var(--bs-bg-card);
  color: var(--bs-text-primary);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--bs-secondary);
  box-shadow: 0 0 0 3px rgba(47, 93, 79, 0.12);
}

.search-bar input::placeholder {
  color: var(--bs-text-placeholder);
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--bs-text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.clear-search:hover {
  color: var(--bs-accent);
}

.stats-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  background: var(--bs-bg-card);
  border: 1px solid var(--bs-border);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--bs-text-secondary);
}

.stats-badge i {
  color: var(--bs-secondary);
}

/* ========== TABLE ========== */
.books-table-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 1rem 2rem;
}

.books-table-container {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(31, 27, 22, 0.08);
  border: 1px solid var(--bs-border);
  overflow: hidden;
}

.books-table {
  width: 100%;
  border-collapse: collapse;
}

.books-table thead tr {
  background: var(--bs-bg-header);
  border-bottom: 1px solid var(--bs-border);
}

.books-table th {
  padding: 0.9rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bs-text-muted);
}

.books-table td {
  padding: 0.9rem 1rem;
  font-size: 0.85rem;
  color: var(--bs-text-secondary);
  border-bottom: 1px solid var(--bs-border);
}

.books-table tbody tr:last-child td {
  border-bottom: none;
}

.books-table tbody tr {
  transition: background 0.15s ease;
}

.books-table tbody tr:hover {
  background: var(--bs-bg-soft);
}

.image-cell {
  width: 65px;
}

.book-cover img {
  width: 45px;
  height: 62px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(31, 27, 22, 0.12);
}

.book-title {
  font-weight: 600;
  color: var(--bs-text-primary);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.author-info i {
  color: var(--bs-secondary);
  font-size: 0.7rem;
}

.year-badge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  background: var(--bs-secondary-soft);
  color: var(--bs-secondary);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.editor-text {
  color: var(--bs-text-secondary);
}

.actions-cell {
  white-space: nowrap;
  text-align: right;
}

.actions-wrapper {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.btn-edit {
  background: var(--bs-secondary-soft);
  color: var(--bs-secondary);
}

.btn-edit:hover {
  background: var(--bs-secondary);
  color: #FFFFFF;
  transform: translateY(-1px);
}

.btn-delete {
  background: var(--bs-accent-soft);
  color: var(--bs-accent);
}

.btn-delete:hover {
  background: var(--bs-accent);
  color: #FFFFFF;
  transform: translateY(-1px);
}

/* ========== PAGINATION ========== */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.2rem;
  border-top: 1px solid var(--bs-border);
  background: rgba(253, 250, 245, 0.85);
  flex-wrap: wrap;
  gap: 0.8rem;
}

.pagination-info {
  font-size: 0.8rem;
  color: var(--bs-text-muted);
}

.pagination-info .highlight {
  font-weight: 600;
  color: var(--bs-text-primary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid var(--bs-border);
  background: var(--bs-bg-card);
  color: var(--bs-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bs-secondary);
  border-color: var(--bs-secondary);
  color: #FFFFFF;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 34px;
  height: 34px;
  padding: 0 0.7rem;
  border-radius: 9px;
  border: 1px solid var(--bs-border);
  background: var(--bs-bg-card);
  color: var(--bs-text-secondary);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.pagination-page:hover:not(.active) {
  background: var(--bs-bg-header);
  border-color: var(--bs-border-strong);
}

.pagination-page.active {
  background: var(--bs-accent);
  border-color: var(--bs-accent);
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(183, 65, 28, 0.22);
}

.pagination-per-page select {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--bs-border);
  border-radius: 999px;
  font-size: 0.75rem;
  background: var(--bs-bg-card);
  cursor: pointer;
  color: var(--bs-text-secondary);
  transition: border-color 0.2s;
}

.pagination-per-page select:hover {
  border-color: var(--bs-border-strong);
}

/* ========== ÉTATS ========== */
.loading-state {
  text-align: center;
  padding: 2.5rem;
  color: var(--bs-text-muted);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 2px solid var(--bs-border);
  border-top-color: var(--bs-secondary);
  border-radius: 50%;
  margin: 0 auto 0.8rem;
  animation: spin 0.8s linear infinite;
}

.no-books {
  text-align: center;
  padding: 2.5rem;
  color: var(--bs-text-muted);
}

.no-books i {
  font-size: 2.5rem;
  color: var(--bs-border-strong);
  margin-bottom: 0.8rem;
}

.btn-outline {
  margin-top: 0.8rem;
  padding: 0.5rem 1.3rem;
  background: var(--bs-bg-card);
  border: 1.5px solid var(--bs-border);
  border-radius: 999px;
  color: var(--bs-text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: var(--bs-accent);
  color: #FFFFFF;
  border-color: var(--bs-accent);
  transform: translateY(-1px);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .admin-books {
    height: calc(100vh - 60px);
    top: 60px;
  }
  .admin-header {
    padding: 0.8rem 1rem;
    flex-direction: column;
    align-items: stretch;
  }
  .header-decoration {
    display: none;
  }
  .search-section {
    padding: 0.6rem 1rem;
    flex-direction: column;
    align-items: stretch;
  }
  .search-bar {
    max-width: none;
  }
  .books-table-wrapper {
    padding: 0.6rem 1rem;
  }
  .pagination-section {
    flex-direction: column;
  }
}
</style>
