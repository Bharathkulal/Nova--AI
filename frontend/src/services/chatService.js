import api from './api';

export const sendMessage = async (sessionId, message) => {
  const response = await api.post('/chat/message', { sessionId, message });
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/chat/sessions');
  return response.data;
};

export const getMessages = async (sessionId) => {
  const response = await api.get(`/chat/sessions/${sessionId}/messages`);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/chat/sessions/${sessionId}`);
  return response.data;
};

export const createSession = async (title) => {
  const response = await api.post('/chat/sessions', { title });
  return response.data;
};

export const clearChats = async () => {
  const response = await api.delete('/chat/sessions');
  return response.data;
};
