import api from './client'

export const listDocuments = async () => {
  const response = await api.get('/documents')
  return response.data?.data || []
}

export const createDocument = async (payload) => {
  const response = await api.post('/documents', payload)
  return response.data?.data
}

export const updateDocument = async (documentId, payload) => {
  const response = await api.patch(`/documents/${documentId}`, payload)
  return response.data?.data
}

export const deleteDocument = async (documentId) => {
  await api.delete(`/documents/${documentId}`)
}
