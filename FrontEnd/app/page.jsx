"use client"

import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Navbar from "../components/Navbar"
import { Button } from "../components/ui/button"

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Banking App</h1>
          <p className="text-xl text-gray-600 mb-8">Manage your finances with ease and security</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/register")}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
