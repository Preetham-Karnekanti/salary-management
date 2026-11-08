import apiClient from '@/axios/axios';

export interface ReferenceOption {
  id: number;
  name: string;
}

export const getCountries = async (signal?: AbortSignal): Promise<ReferenceOption[]> => {
  const response = await apiClient.get<ReferenceOption[]>('/countries', {
    signal,
  });

  return response.data;
};

export const getDepartments = async (signal?: AbortSignal): Promise<ReferenceOption[]> => {
  const response = await apiClient.get<ReferenceOption[]>('/departments', {
    signal,
  });

  return response.data;
};
