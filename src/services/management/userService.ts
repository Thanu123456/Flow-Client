import api from '../api';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../types/entities/user.types';

export const userService = {
  async listUsers(): Promise<User[]> {
    const response = await api.get<{ data: User[] }>('/admin/users');
    return response.data.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get<{ data: User }>(`/admin/users/${id}`);
    return response.data.data;
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<{ data: User }>('/admin/users', data);
    return response.data.data;
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<{ data: User }>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async resetPIN(id: string): Promise<{ pin: string }> {
    const response = await api.post<{ pin: string }>(`/admin/users/${id}/reset-pin`);
    return response.data;
  }
};
