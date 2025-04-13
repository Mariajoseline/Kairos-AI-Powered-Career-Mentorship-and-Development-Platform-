import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useApi = (endpoint: string, options = {}) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => apiClient.get(endpoint).then(res => res.data),
    ...options,
  });
};