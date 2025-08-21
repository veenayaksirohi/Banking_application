"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Banknote, Landmark, ArrowLeftRight, History, LogOut, Wallet, PlusCircle, UserCircle } from "lucide-react"

// Types
type Account = {
  accountNumber: string
  accountType: "Savings" | "Current"
  balance: number
}

type User = {
  userId: string
  fullName: string
  username: string
  email: string
  phone_number: string
  accounts: Account[]
}

type Transaction = {
  id: string
  accountNumber: string
  date: string
  description: string
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER"
  amount: number // Positive for deposit, negative for withdrawal/transfer
  balance_after: number
}

// Mock data
const initialUser: User = {
  userId: "user_001",
  fullName: "John Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  phone_number: "1234567890",
  accounts: [
    { accountNumber: "ACC0001234", accountType: "Savings", balance: 5000.0 },
    { accountNumber: "ACC0005678", accountType: "Current", balance: 1250.75 },
  ],
}

const initialTransactions: Transaction[] = [
  {
    id: "txn_1",
    accountNumber: "ACC0001234",
    date: "2024-06-24",
    description: "Initial Deposit",
    type: "DEPOSIT",
    amount: 5000.0,
    balance_after: 5000.0,
  },
  {
    id: "txn_2",
    accountNumber: "ACC0001234",
    date: "2024-06-23",
    description: "Groceries Store",
    type: "WITHDRAWAL",
    amount: -75.5,
    balance_after: 4924.5,
  },
  {
    id: "txn_3",
    accountNumber: "ACC0005678",
    date: "2024-06-22",
    description: "Salary",
    type: "DEPOSIT",
    amount: 1250.75,
    balance_after: 1250.75,
  },
  {
    id: "txn_4",
    accountNumber: "ACC0001234",
    date: "2024-06-21",
    description: "Transfer to Jane Doe",
    type: "TRANSFER",
    amount: -500.0,
    balance_after: 4424.5,
  },
]

// Main Component
export default function BankingApp() {
  const [view, setView] = useState("login") // 'login', 'register', 'dashboard'
  const [user, setUser] = useState<User | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false)

  useEffect(() => {
    if (user && user.accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(user.accounts[0])
    }
  }, [user, selectedAccount])

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, you'd call your /login API here and set user data
    setUser(initialUser)
    setSelectedAccount(initialUser.accounts[0]) // Select first account by default
    setView("dashboard")
  }

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, you'd call your /register API here
    alert("Registration successful! Please log in.")
    setView("login")
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedAccount(null)
    setView("login")
  }

  const handleAccountChange = (accountNumber: string) => {
    const account = user?.accounts.find((acc) => acc.accountNumber === accountNumber)
    if (account) {
      setSelectedAccount(account)
    }
  }

  const handleCreateAccount = (accountType: "Savings" | "Current", initialDeposit: number) => {
    if (!user) return

    const newAccountNumber = `ACC${Date.now().toString().slice(-7)}`
    const newAccount: Account = {
      accountNumber: newAccountNumber,
      accountType,
      balance: initialDeposit,
    }
    const updatedUser = {
      ...user,
      accounts: [...user.accounts, newAccount],
    }
    setUser(updatedUser)
    setSelectedAccount(newAccount) // Select the newly created account

    if (initialDeposit > 0) {
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        accountNumber: newAccountNumber,
        date: new Date().toISOString().split("T")[0],
        description: "Initial Deposit",
        type: "DEPOSIT",
        amount: initialDeposit,
        balance_after: initialDeposit,
      }
      setTransactions((prev) => [newTransaction, ...prev])
    }
    setIsCreateAccountOpen(false)
  }

  const handleTransaction = (
    type: "deposit" | "withdraw" | "transfer",
    amountStr: string,
    recipientAccountNumber?: string,
  ) => {
    if (!selectedAccount || !user) return

    const amount = Number.parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.")
      return
    }

    let newBalance = selectedAccount.balance
    let transactionAmount = amount
    let description = ""

    if (type === "deposit") {
      newBalance += amount
      description = "Cash Deposit"
    } else {
      // withdraw or transfer
      if (amount > selectedAccount.balance) {
        alert("Insufficient funds.")
        return
      }
      newBalance -= amount
      transactionAmount = -amount // Store as negative for withdrawals/transfers
      description = type === "withdraw" ? "Cash Withdrawal" : `Transfer to ${recipientAccountNumber || "Unknown"}`
    }

    // Update account balance
    const updatedAccounts = user.accounts.map((acc) =>
      acc.accountNumber === selectedAccount.accountNumber ? { ...acc, balance: newBalance } : acc,
    )
    setUser({ ...user, accounts: updatedAccounts })
    setSelectedAccount(updatedAccounts.find((acc) => acc.accountNumber === selectedAccount.accountNumber)!)

    // Add new transaction
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      accountNumber: selectedAccount.accountNumber,
      date: new Date().toISOString().split("T")[0],
      description,
      type: type.toUpperCase() as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER",
      amount: transactionAmount,
      balance_after: newBalance,
    }
    setTransactions((prev) => [newTransaction, ...prev])

    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`)
  }

  const renderContent = () => {
    if (!user || !selectedAccount) {
      // If user or selectedAccount is not set, show login/register
      switch (view) {
        case "register":
          return <RegisterForm setView={setView} handleRegister={handleRegister} />
        case "login":
        default:
          return <LoginForm setView={setView} handleLogin={handleLogin} />
      }
    }
    // If user and selectedAccount are set, show dashboard
    return (
      <Dashboard
        user={user}
        selectedAccount={selectedAccount}
        transactions={transactions.filter((tx) => tx.accountNumber === selectedAccount.accountNumber)}
        onAccountChange={handleAccountChange}
        onLogout={handleLogout}
        onTransaction={handleTransaction}
        onCreateAccount={() => setIsCreateAccountOpen(true)}
      />
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {renderContent()}
      {user && (
        <CreateAccountDialog
          isOpen={isCreateAccountOpen}
          onOpenChange={setIsCreateAccountOpen}
          onCreateAccount={handleCreateAccount}
        />
      )}
    </div>
  )
}

// Login Form Component
function LoginForm({
  setView,
  handleLogin,
}: { setView: (view: string) => void; handleLogin: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <UserCircle className="mr-2 h-7 w-7 text-gray-600 dark:text-gray-400" />
          Welcome Back!
        </CardTitle>
        <CardDescription>Enter your credentials to access your accounts.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email or Phone</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit">
            Sign In
          </Button>
          <Button variant="link" onClick={() => setView("register")}>
            Don't have an account? Register
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// Registration Form Component
function RegisterForm({
  setView,
  handleRegister,
}: { setView: (view: string) => void; handleRegister: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <UserCircle className="mr-2 h-7 w-7 text-gray-600 dark:text-gray-400" />
          Create an Account
        </CardTitle>
        <CardDescription>Fill in the details below to join our bank.</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input id="fullname" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="johndoe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="1234567890" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit">
            Register
          </Button>
          <Button variant="link" onClick={() => setView("login")}>
            Already have an account? Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// Dashboard Component
interface DashboardProps {
  user: User
  selectedAccount: Account
  transactions: Transaction[]
  onAccountChange: (accountNumber: string) => void
  onLogout: () => void
  onTransaction: (type: "deposit" | "withdraw" | "transfer", amount: string, recipientAccountNumber?: string) => void
  onCreateAccount: () => void
}

function Dashboard({
  user,
  selectedAccount,
  transactions,
  onAccountChange,
  onLogout,
  onTransaction,
  onCreateAccount,
}: DashboardProps) {
  const [transactionAmount, setTransactionAmount] = useState("")
  const [recipientAccount, setRecipientAccount] = useState("")

  const handleSubmitTransaction = (type: "deposit" | "withdraw" | "transfer") => {
    if (type === "transfer" && !recipientAccount) {
      alert("Please enter recipient account number for transfer.")
      return
    }
    onTransaction(type, transactionAmount, type === "transfer" ? recipientAccount : undefined)
    setTransactionAmount("")
    if (type === "transfer") setRecipientAccount("")
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user.fullName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Select value={selectedAccount.accountNumber} onValueChange={onAccountChange}>
              <SelectTrigger className="w-auto min-w-[200px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {user.accounts.map((acc) => (
                  <SelectItem key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountType} - {acc.accountNumber.slice(-4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onCreateAccount} className="bg-white dark:bg-gray-800">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Account
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Selected: {selectedAccount.accountType} ({selectedAccount.accountNumber})
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Wallet className="h-6 w-6" />
            Current Balance
          </CardTitle>
          <CardDescription className="text-4xl font-bold text-gray-900 dark:text-white pt-2">
            ${selectedAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="deposit">
            <Banknote className="mr-1 sm:mr-2 h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <Landmark className="mr-1 sm:mr-2 h-4 w-4" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <ArrowLeftRight className="mr-1 sm:mr-2 h-4 w-4" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-1 sm:mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <TransactionActionCard
            title="Deposit Money"
            type="deposit"
            amount={transactionAmount}
            setAmount={setTransactionAmount}
            onAction={() => handleSubmitTransaction("deposit")}
            selectedAccount={selectedAccount}
          >
            <p className="text-sm text-muted-foreground">
              Add funds to your {selectedAccount.accountType} account ({selectedAccount.accountNumber.slice(-4)}).
            </p>
          </TransactionActionCard>
        </TabsContent>

        <TabsContent value="withdraw">
          <TransactionActionCard
            title="Withdraw Funds"
            type="withdraw"
            amount={transactionAmount}
            setAmount={setTransactionAmount}
            onAction={() => handleSubmitTransaction("withdraw")}
            selectedAccount={selectedAccount}
          >
            <p className="text-sm text-muted-foreground">
              Withdraw cash from your {selectedAccount.accountType} account ({selectedAccount.accountNumber.slice(-4)}).
            </p>
          </TransactionActionCard>
        </TabsContent>

        <TabsContent value="transfer">
          <TransactionActionCard
            title="Transfer to Another Account"
            type="transfer"
            amount={transactionAmount}
            setAmount={setTransactionAmount}
            onAction={() => handleSubmitTransaction("transfer")}
            selectedAccount={selectedAccount}
            recipientAccount={recipientAccount}
            setRecipientAccount={setRecipientAccount}
          >
            <p className="text-sm text-muted-foreground">
              Transfer funds from your {selectedAccount.accountType} account ({selectedAccount.accountNumber.slice(-4)}
              ).
            </p>
          </TransactionActionCard>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Showing transactions for {selectedAccount.accountType} account ({selectedAccount.accountNumber}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.type === "DEPOSIT"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${tx.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          ${Math.abs(tx.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">${tx.balance_after.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No transactions for this account.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TransactionActionCardProps {
  title: string
  type: "deposit" | "withdraw" | "transfer"
  amount: string
  setAmount: (value: string) => void
  onAction: () => void
  selectedAccount: Account
  children: React.ReactNode
  recipientAccount?: string
  setRecipientAccount?: (value: string) => void
}

function TransactionActionCard({
  title,
  type,
  amount,
  setAmount,
  onAction,
  selectedAccount,
  children,
  recipientAccount,
  setRecipientAccount,
}: TransactionActionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {children}
      </CardHeader>
      <CardContent className="space-y-4">
        {type === "transfer" && setRecipientAccount && (
          <div className="space-y-2">
            <Label htmlFor="recipient-account">Recipient Account Number</Label>
            <Input
              id="recipient-account"
              placeholder="ACC000XXXX"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor={`${type}-amount`}>Amount</Label>
          <Input
            id={`${type}-amount`}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onAction}>{type.charAt(0).toUpperCase() + type.slice(1)}</Button>
      </CardFooter>
    </Card>
  )
}

interface CreateAccountDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCreateAccount: (accountType: "Savings" | "Current", initialDeposit: number) => void
}

function CreateAccountDialog({ isOpen, onOpenChange, onCreateAccount }: CreateAccountDialogProps) {
  const [accountType, setAccountType] = useState<"Savings" | "Current">("Savings")
  const [initialDeposit, setInitialDeposit] = useState("")

  const handleSubmit = () => {
    const depositAmount = Number.parseFloat(initialDeposit) || 0
    if (depositAmount < 0) {
      alert("Initial deposit cannot be negative.")
      return
    }
    onCreateAccount(accountType, depositAmount)
    setInitialDeposit("") // Reset form
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
          <DialogDescription>Choose an account type and make an optional initial deposit.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-type" className="text-right">
              Account Type
            </Label>
            <Select value={accountType} onValueChange={(value: "Savings" | "Current") => setAccountType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Current">Current</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initial-deposit" className="text-right">
              Initial Deposit
            </Label>
            <Input
              id="initial-deposit"
              type="number"
              placeholder="0.00 (Optional)"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
