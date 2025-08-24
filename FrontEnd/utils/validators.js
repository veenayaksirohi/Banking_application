export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ""))
}

export const validatePassword = (password) => {
  return password && password.length > 0 && password.length <= 128
}

export const validateAmount = (amount) => {
  const num = Number.parseFloat(amount)
  return !isNaN(num) && num > 0
}

export const validateName = (name, maxLength = 30) => {
  return name && name.trim().length > 0 && name.length <= maxLength
}
