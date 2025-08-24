"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { formatCurrency, formatAccountNumber } from "../../utils/formatters"
import { accountService } from "../../services/accountService"

const AccountCard = ({ account, onUpdate }) => {
  const [balance, setBalance] = useState(account.balance)
  const [loading, setLoading] = useState(false)

  const refreshBalance = async () => {
    setLoading(true)
    try {
      const response = await accountService.getBalance(account.accountNumber)
      setBalance(response.balance)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error("Failed to refresh balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    return status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getTypeColor = (type) => {
    return type === "SAVINGS" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{formatAccountNumber(account.accountNumber)}</CardTitle>
        <div className="flex gap-2">
          <Badge className={getTypeColor(account.accountType)}>{account.accountType}</Badge>
          <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshBalance} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Created: {new Date(account.dateCreated).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountCard
