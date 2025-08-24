import RegisterForm from "../../components/auth/RegisterForm"
import Navbar from "../../components/Navbar"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </div>
  )
}
