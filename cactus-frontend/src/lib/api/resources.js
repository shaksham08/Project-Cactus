import api from './client'

export const listResources = async () => {
  const response = await api.get('/resources')
  return response.data?.data || []
}

export const createResource = async (payload) => {
  const response = await api.post('/resources', payload)
  return response.data?.data
}

export const updateResource = async (resourceId, payload) => {
  const response = await api.patch(`/resources/${resourceId}`, payload)
  return response.data?.data
}

export const deleteResource = async (resourceId) => {
  await api.delete(`/resources/${resourceId}`)
}
