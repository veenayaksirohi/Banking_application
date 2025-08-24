"use client"

import { useState } from "react"
import { accountService } from "../../services/accountService"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { validateAmount } from "../../utils/validators"

const CreateAccountForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    accountType: "",
    balance: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.accountType) {
      newErrors.accountType = "Account type is required"
    }

    if (formData.balance && !validateAmount(formData.balance)) {
      newErrors.balance = "Please enter a valid amount"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const accountData = {
        accountType: formData.accountType,
        ...(formData.balance && { balance: Number.parseFloat(formData.balance) }),
      }

      await accountService.createAccount(accountData)
      onSuccess?.()
    } catch (error) {
      setErrors({ submit: error.message || "Failed to create account" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Account</CardTitle>
        <CardDescription>Choose your account type and set an initial balance (optional)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Select value={formData.accountType} onValueChange={(value) => handleChange("accountType", value)}>
              <SelectTrigger className={errors.accountType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAVINGS">Savings Account</SelectItem>
                <SelectItem value="CURRENT">Current Account</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && <p className="text-sm text-red-500 mt-1">{errors.accountType}</p>}
          </div>

          <div>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Initial balance (optional)"
              value={formData.balance}
              onChange={(e) => handleChange("balance", e.target.value)}
              className={errors.balance ? "border-red-500" : ""}
            />
            {errors.balance && <p className="text-sm text-red-500 mt-1">{errors.balance}</p>}
            <p className="text-xs text-gray-500 mt-1">Leave empty to start with $0.00</p>
          </div>

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
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

export default CreateAccountForm
