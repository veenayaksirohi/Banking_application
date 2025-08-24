import { api } from "../lib/api"

export const accountService = {
  async createAccount(data) {
    const response = await api.post("/accounts", data)
    return response.data
  },

  async getAccount(accountNumber) {
    const response = await api.get(`/accounts/${accountNumber}`)
    return response.data
  },

  async getBalance(accountNumber) {
    const response = await api.get(`/accounts/${accountNumber}/balance`)
    return response.data
  },

  async getUserAccounts(userId) {
    const response = await api.get(`/users/${userId}/accounts`)
    return response.data
  },

  async updateAccount(accountNumber, data) {
    const response = await api.put(`/accounts/${accountNumber}`, data)
    return response.data
  },

  async deleteAccount(accountNumber) {
    const response = await api.delete(`/accounts/${accountNumber}`)
    return response.data
  },
}
