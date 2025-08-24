import { api } from "../lib/api"

export const authService = {
  async login(credentials) {
    const response = await api.post("/auth/login", credentials)
    const { token, user } = response.data

    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
    }

    return response.data
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      return userData ? JSON.parse(userData) : null
    }
    return null
  },

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  },
}
