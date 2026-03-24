import axios from 'axios'

export const TOKEN_KEY = 'cactus_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getErrorMessage = (error) => {
  const fallback = 'Something went wrong. Please try again.'

  if (!error) {
    return fallback
  }

  return error.response?.data?.message || error.message || fallback
}

export default api
