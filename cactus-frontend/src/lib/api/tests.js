import api from './client'

export const listTests = async () => {
  const response = await api.get('/tests')
  return response.data?.data || []
}

export const getTest = async (testId) => {
  const response = await api.get(`/tests/${testId}`)
  return response.data?.data
}

export const createTest = async (payload) => {
  const response = await api.post('/tests', payload)
  return response.data?.data
}

export const updateTest = async (testId, payload) => {
  const response = await api.patch(`/tests/${testId}`, payload)
  return response.data?.data
}

export const submitTest = async (testId, payload) => {
  const response = await api.post(`/tests/${testId}/submit`, payload)
  return response.data?.data
}

export const listAttempts = async () => {
  const response = await api.get('/tests/attempts/history')
  return response.data?.data || []
}

export const deleteTest = async (testId) => {
  await api.delete(`/tests/${testId}`)
}

export const getTestLeaderboard = async (testId) => {
  const response = await api.get(`/tests/${testId}/leaderboard`)
  return response.data?.data
}
