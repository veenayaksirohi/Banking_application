"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { accountService } from "../../services/accountService"
import ProtectedRoute from "../../components/ProtectedRoute"
import Navbar from "../../components/Navbar"
import AccountList from "../../components/accounts/AccountList"
import CreateAccountForm from "../../components/accounts/CreateAccountForm"
import AccountDetails from "../../components/accounts/AccountDetails"
import TransactionManager from "../../components/transactions/TransactionManager"
import UserProfile from "../../components/UserProfile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { User, CreditCard, ArrowRightLeft, Plus } from "lucide-react"
import { formatCurrency, formatAccountNumber } from "../../utils/formatters"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("accounts")
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreateAccount = () => {
    setShowCreateAccount(true)
    setSelectedAccount(null)
  }

  const handleAccountCreated = () => {
    setShowCreateAccount(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancelCreate = () => {
    setShowCreateAccount(false)
  }

  const handleViewAccount = (accountNumber) => {
    setSelectedAccount(accountNumber)
    setActiveTab("account-details")
  }

  const handleBackToAccounts = () => {
    setSelectedAccount(null)
    setActiveTab("accounts")
  }

  const handleTransactionComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your accounts and transactions</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="account-details" className="flex items-center gap-2" disabled={!selectedAccount}>
                <Plus className="h-4 w-4" />
                Account Details
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              {showCreateAccount ? (
                <div className="flex justify-center">
                  <CreateAccountForm onSuccess={handleAccountCreated} onCancel={handleCancelCreate} />
                </div>
              ) : (
                <AccountList key={refreshTrigger} onCreateAccount={handleCreateAccount} />
              )}
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionSelector
                onAccountSelect={handleViewAccount}
                onTransactionComplete={handleTransactionComplete}
              />
            </TabsContent>

            <TabsContent value="account-details">
              {selectedAccount ? (
                <AccountDetails accountNumber={selectedAccount} onBack={handleBackToAccounts} />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Select an account to view details</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Component to select account for transactions
function TransactionSelector({ onAccountSelect, onTransactionComplete }) {
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("")
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.userId) return

      try {
        const response = await accountService.getUserAccounts(user.userId)
        setAccounts(response.accounts || [])
      } catch (error) {
        console.error("Failed to fetch accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading accounts...</div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 mb-4">You need at least one account to make transactions</p>
          <Button onClick={() => onAccountSelect(null)}>Create Account</Button>
        </CardContent>
      </Card>
    )
  }

  if (!selectedAccountNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Account for Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card
                key={account.accountNumber}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedAccountNumber(account.accountNumber)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatAccountNumber(account.accountNumber)}</p>
                      <p className="text-sm text-gray-600">{account.accountType}</p>
                    </div>
                    <p className="font-bold">{formatCurrency(account.balance)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return <TransactionManager accountNumber={selectedAccountNumber} onTransactionComplete={onTransactionComplete} />
}
