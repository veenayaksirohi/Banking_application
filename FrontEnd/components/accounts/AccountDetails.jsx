"use client"

import { useState, useEffect } from "react"
import { accountService } from "../../services/accountService"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { formatCurrency, formatAccountNumber, formatDate } from "../../utils/formatters"
import { ArrowLeft } from "lucide-react"

const AccountDetails = ({ accountNumber, onBack }) => {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true)
      try {
        const response = await accountService.getAccount(accountNumber)
        setAccount(response.account)
        setError("")
      } catch (error) {
        setError("Failed to load account details")
        console.error("Failed to fetch account details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (accountNumber) {
      fetchAccountDetails()
    }
  }, [accountNumber])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading account details...</div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error || "Account not found"}</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    return status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getTypeColor = (type) => {
    return type === "SAVINGS" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Account Details</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{formatAccountNumber(account.accountNumber)}</CardTitle>
            <div className="flex gap-2">
              <Badge className={getTypeColor(account.accountType)}>{account.accountType}</Badge>
              <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Balance Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-semibold text-2xl">{formatCurrency(account.balance)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium">{account.accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{account.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Created:</span>
                  <span className="font-medium">{formatDate(account.dateCreated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(account.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountDetails
