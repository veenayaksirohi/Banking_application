"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { validateEmail, validatePhoneNumber } from "../../utils/validators"

const LoginForm = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number is required"
    } else {
      const isEmail = formData.emailOrPhone.includes("@")
      if (isEmail && !validateEmail(formData.emailOrPhone)) {
        newErrors.emailOrPhone = "Please enter a valid email address"
      } else if (!isEmail && !validatePhoneNumber(formData.emailOrPhone)) {
        newErrors.emailOrPhone = "Please enter a valid 10-digit phone number"
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const isEmail = formData.emailOrPhone.includes("@")
      const loginData = {
        password: formData.password,
        ...(isEmail ? { email: formData.emailOrPhone } : { phoneNumber: formData.emailOrPhone.replace(/\D/g, "") }),
      }

      await login(loginData)
      router.push("/dashboard")
    } catch (error) {
      setErrors({ submit: error.message || "Login failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your email or phone number and password to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className={errors.emailOrPhone ? "border-red-500" : ""}
            />
            {errors.emailOrPhone && <p className="text-sm text-red-500 mt-1">{errors.emailOrPhone}</p>}
          </div>

          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default LoginForm
