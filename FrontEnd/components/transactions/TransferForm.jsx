"use client"

import { useState } from "react"
import { transactionService } from "../../services/transactionService"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { validateAmount } from "../../utils/validators"

const TransferForm = ({ accountNumber, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    toAccountNumber: "",
    amount: "",
    description: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.toAccountNumber.trim()) {
      newErrors.toAccountNumber = "Recipient account number is required"
    } else if (formData.toAccountNumber.replace(/\D/g, "").length !== 10) {
      newErrors.toAccountNumber = "Please enter a valid 10-digit account number"
    } else if (formData.toAccountNumber.replace(/\D/g, "") === accountNumber) {
      newErrors.toAccountNumber = "Cannot transfer to the same account"
    }

    if (!validateAmount(formData.amount)) {
      newErrors.amount = "Please enter a valid amount greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const transferData = {
        toAccountNumber: formData.toAccountNumber.replace(/\D/g, ""),
        amount: Number.parseFloat(formData.amount),
        ...(formData.description && { description: formData.description }),
      }

      await transactionService.transfer(accountNumber, transferData)
      onSuccess?.()
    } catch (error) {
      setErrors({ submit: error.message || "Failed to process transfer" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Transfer Money</CardTitle>
        <CardDescription>Transfer money to another account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              name="toAccountNumber"
              placeholder="Recipient account number"
              value={formData.toAccountNumber}
              onChange={handleChange}
              className={errors.toAccountNumber ? "border-red-500" : ""}
            />
            {errors.toAccountNumber && <p className="text-sm text-red-500 mt-1">{errors.toAccountNumber}</p>}
          </div>

          <div>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              placeholder="Amount to transfer"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <Textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Processing..." : "Transfer"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default TransferForm
