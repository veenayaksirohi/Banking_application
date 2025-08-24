const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    // Resolve full URL safely:
    let url = endpoint
    if (/^https?:\/\//i.test(endpoint)) {
      url = endpoint
    } else if (this.baseURL) {
      // Ensure there's exactly one slash between base and endpoint
      url = this.baseURL.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '')
    } else if (typeof window !== 'undefined') {
      url = window.location.origin.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '')
    } else {
      url = 'http://localhost:3000'.replace(/\/$/, '') + '/' + endpoint.replace(/^\//, '')
    }

    // Debugging help: log resolved URL and method
    try {
      // eslint-disable-next-line no-console
      console.debug('[api] request', options.method || 'GET', url)
    } catch (e) {}
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)

      // Try parse JSON, but fall back to text for HTML error pages
      let data
      try {
        data = await response.json()
      } catch (parseErr) {
        const raw = await response.text()
        // include raw response in error for easier debugging
        const err = new Error(
          `Failed to parse JSON response (status: ${response.status}). Raw response starts with: ${raw.slice(0, 200)}`
        )
        err.raw = raw
        err.status = response.status
        throw err
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return { data, status: response.status }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("API request failed:", error)
      throw error
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: "GET" })
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: "POST", body: data })
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: "PUT", body: data })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }
}

export const api = new ApiService()

// Provide a default export for callers that import the default
export default api
