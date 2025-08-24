import { api } from "../lib/api"

export const transactionService = {
  async getHistory(accountNumber, params = {}) {
    const response = await api.get(`/accounts/${accountNumber}/transactions`, params)
    return response.data
  },

  async deposit(accountNumber, data) {
    const response = await api.post(`/accounts/${accountNumber}/transactions/deposit`, data)
    return response.data
  },

  async withdraw(accountNumber, data) {
    const response = await api.post(`/accounts/${accountNumber}/transactions/withdraw`, data)
    return response.data
  },

  async transfer(accountNumber, data) {
    const response = await api.post(`/accounts/${accountNumber}/transactions/transfer`, data)
    return response.data
  },
}
