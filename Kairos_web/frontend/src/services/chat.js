import api from './api';

export const sendMessage = async (message, conversationId) => {
  return api.post('/api/chat/send-message', { message, conversation_id: conversationId });
};

export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('file', audioFile);
  return api.post('/api/chat/transcribe', formData);
};