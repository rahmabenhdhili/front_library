import { defineStore } from 'pinia'
import { getTokenData } from '../services/token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    user: (state) => {
      if (!state.token) return null
      const data = getTokenData()
      return data ? {
        email: data.email,
        username: data.username,
        role: state.role
      } : null
    },
  },

  actions: {
    login(token, role) {
      this.token = token
      this.role = role
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
    },

    logout() {
      this.token = null
      this.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    },
  },
})
