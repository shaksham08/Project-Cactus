import api from './client'

export const listProgress = async () => {
  const response = await api.get('/progress')
  return response.data?.data || []
}

export const createProgress = async (payload) => {
  const response = await api.post('/progress', payload)
  return response.data?.data
}

export const updateProgress = async (progressId, payload) => {
  const response = await api.patch(`/progress/${progressId}`, payload)
  return response.data?.data
}

export const deleteProgress = async (progressId) => {
  await api.delete(`/progress/${progressId}`)
}
