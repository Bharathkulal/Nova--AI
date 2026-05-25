import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('nova_token', response.data.token);
    localStorage.setItem('nova_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  if (response.data.token) {
    localStorage.setItem('nova_token', response.data.token);
    localStorage.setItem('nova_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('nova_token');
  localStorage.removeItem('nova_user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('nova_user');
  if (userStr) return JSON.parse(userStr);
  return null;
};
