import api from './client'

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload)
  return response.data?.data
}

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload)
  return response.data?.data
}

export const getProfile = async () => {
  const response = await api.get('/auth/me')
  return response.data?.data
}
