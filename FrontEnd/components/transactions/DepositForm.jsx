"use client"

import { useState } from "react"
import { transactionService } from "../../services/transactionService"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { validateAmount } from "../../utils/validators"

const DepositForm = ({ accountNumber, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
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
      const depositData = {
        amount: Number.parseFloat(formData.amount),
        ...(formData.description && { description: formData.description }),
      }

      await transactionService.deposit(accountNumber, depositData)
      onSuccess?.()
    } catch (error) {
      setErrors({ submit: error.message || "Failed to process deposit" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Deposit Money</CardTitle>
        <CardDescription>Add money to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              placeholder="Amount to deposit"
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
              {loading ? "Processing..." : "Deposit"}
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

export default DepositForm
