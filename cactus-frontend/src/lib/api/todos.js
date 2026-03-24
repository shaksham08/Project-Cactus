import api from './client'

export const listTodos = async () => {
  const response = await api.get('/todos')
  return response.data?.data || []
}

export const createTodo = async (payload) => {
  const response = await api.post('/todos', payload)
  return response.data?.data
}

export const updateTodo = async (todoId, payload) => {
  const response = await api.patch(`/todos/${todoId}`, payload)
  return response.data?.data
}

export const deleteTodo = async (todoId) => {
  await api.delete(`/todos/${todoId}`)
}
