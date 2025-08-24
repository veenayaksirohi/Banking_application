"use client"

import { useState, useEffect } from "react"
import { transactionService } from "../../services/transactionService"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react"

const TransactionHistory = ({ accountNumber }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    type: "ALL", // Updated default value to "ALL"
    limit: "50",
    offset: "0",
  })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.type !== "ALL") params.type = filters.type // Updated condition to check for "ALL"
      if (filters.limit) params.limit = filters.limit
      if (filters.offset) params.offset = filters.offset

      const response = await transactionService.getHistory(accountNumber, params)
      setTransactions(response.transactions || [])
      setError("")
    } catch (error) {
      setError("Failed to load transaction history")
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (accountNumber) {
      fetchTransactions()
    }
  }, [accountNumber, filters])

  const getTransactionIcon = (type) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "TRANSFER":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "bg-green-100 text-green-800"
      case "WITHDRAWAL":
        return "bg-red-100 text-red-800"
      case "TRANSFER":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAmountColor = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "text-green-600"
      case "WITHDRAWAL":
        return "text-red-600"
      case "TRANSFER":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTransactionAmount = (amount, type) => {
    const prefix = type === "DEPOSIT" ? "+" : "-"
    return `${prefix}${formatCurrency(amount)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading transactions...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex gap-2">
            <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem> // Updated value to "ALL"
                <SelectItem value="DEPOSIT">Deposits</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                <SelectItem value="TRANSFER">Transfers</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchTransactions}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchTransactions}>Try Again</Button>
          </div>
        )}

        {!error && transactions.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            <p>No transactions found</p>
          </div>
        )}

        {!error && transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.transactionId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{transaction.type}</span>
                      <Badge className={getTransactionColor(transaction.type)}>{transaction.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(transaction.timestamp)}</p>
                    {transaction.description && <p className="text-sm text-gray-500">{transaction.description}</p>}
                    {transaction.relatedAccount && (
                      <p className="text-sm text-gray-500">
                        {transaction.type === "TRANSFER"
                          ? `To: ${transaction.relatedAccount}`
                          : `From: ${transaction.relatedAccount}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                    {formatTransactionAmount(transaction.amount, transaction.type)}
                  </p>
                  <p className="text-sm text-gray-500">Balance: {formatCurrency(transaction.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionHistory
