import api from './api';

export const startInterview = async (topic, difficulty) => {
  return api.post('/api/interview/start', { topic, difficulty });
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/interview/upload-resume', formData);
};