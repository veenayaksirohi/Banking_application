"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { accountService } from "../../services/accountService"
import AccountCard from "./AccountCard"
import { Button } from "../ui/button"
import { Plus } from "lucide-react"

const AccountList = ({ onCreateAccount }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  const fetchAccounts = async () => {
    if (!user?.userId) return

    setLoading(true)
    try {
      const response = await accountService.getUserAccounts(user.userId)
      setAccounts(response.accounts || [])
      setError("")
    } catch (error) {
      setError("Failed to load accounts")
      console.error("Failed to fetch accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [user])

  const handleAccountUpdate = () => {
    fetchAccounts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading accounts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAccounts}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Accounts</h2>
        <Button onClick={onCreateAccount} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You don't have any accounts yet.</p>
          <Button onClick={onCreateAccount}>Create Your First Account</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.accountNumber} account={account} onUpdate={handleAccountUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AccountList
