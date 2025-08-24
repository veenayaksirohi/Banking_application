"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import TransactionHistory from "./TransactionHistory"
import DepositForm from "./DepositForm"
import WithdrawForm from "./WithdrawForm"
import TransferForm from "./TransferForm"
import { Plus, Minus, ArrowRightLeft, History } from "lucide-react"

const TransactionManager = ({ accountNumber, onTransactionComplete }) => {
  const [activeTab, setActiveTab] = useState("history")

  const handleTransactionSuccess = () => {
    setActiveTab("history")
    onTransactionComplete?.()
  }

  const handleCancel = () => {
    setActiveTab("history")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("deposit")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Deposit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("withdraw")}
            className="flex items-center gap-2"
          >
            <Minus className="h-4 w-4" />
            Withdraw
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("transfer")}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <Minus className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <TransactionHistory accountNumber={accountNumber} />
        </TabsContent>

        <TabsContent value="deposit">
          <DepositForm accountNumber={accountNumber} onSuccess={handleTransactionSuccess} onCancel={handleCancel} />
        </TabsContent>

        <TabsContent value="withdraw">
          <WithdrawForm accountNumber={accountNumber} onSuccess={handleTransactionSuccess} onCancel={handleCancel} />
        </TabsContent>

        <TabsContent value="transfer">
          <TransferForm accountNumber={accountNumber} onSuccess={handleTransactionSuccess} onCancel={handleCancel} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TransactionManager
