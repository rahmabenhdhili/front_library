const API_URL = 'http://localhost:3001';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Requête ${options.method || 'GET'} ${API_URL}${endpoint}`);
    console.log('Headers:', headers);
    if (options.body) {
      console.log('Body:', JSON.parse(options.body));
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Erreur réponse:', data);
        throw new Error(data.message || data.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur requête:', error);
      throw error;
    }
  }

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getAllBooks() {
    const response = await this.request('/books/all');
    return response.listeBooks || response || [];
  }

  async getBookById(id) {
    return this.request(`/books/search/${id}`);
  }

  async addBook(bookData) {
    return this.request('/books/new', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id, bookData) {
    return this.request(`/books/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id) {
    return this.request(`/books/remove/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllAuthors() {
    return this.request('/author/all');
  }

  async addAuthor(authorData) {
    return this.request('/author/add', {
      method: 'POST',
      body: JSON.stringify(authorData),
    });
  }

  async getBooksStats() {
    return this.request('/books/stats');
  }

  async getBooksStatsBetweenYears(year1, year2) {
    return this.request(`/books/stats/v2?year1=${year1}&year2=${year2}`);
  }

 async getMyFavorites() {
  return this.request('/favorites');
}

async addFavorite(bookId) {
  return this.request(`/favorites/${bookId}`, { method: 'POST' });
}

async removeFavorite(bookId) {
  return this.request(`/favorites/${bookId}`, { method: 'DELETE' });
}
 
}

export default new ApiService();
