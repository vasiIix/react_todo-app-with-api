import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 1767;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const getCompletedTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}&completed=true `);
};

export const postTodo = (todo: Omit<Todo, 'id' | 'userId'>) => {
  return client.post<Todo>(`/todos`, { ...todo, userId: USER_ID });
};

export const patchTodo = (id: number, changes: Partial<Omit<Todo, 'id'>>) => {
  return client.patch<Todo>(`/todos/${id}`, changes);
};

export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${todoId}`);
};

// Add more methods here
